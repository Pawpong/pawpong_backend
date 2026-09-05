import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { NotifyCriticalErrorUseCase } from '../discord/application/use-cases/notify-critical-error.use-case';

/**
 * Kafka 토픽 정의
 */
export enum KafkaTopic {
    // 채팅 관련
    CHAT_MESSAGE = 'chat.message',
    CHAT_ROOM_CREATED = 'chat.room.created',
    CHAT_ROOM_CLOSED = 'chat.room.closed',

    // 유저 플로우 이벤트
    USER_EVENT_PAGE_VIEW = 'user.event.page_view',
    USER_EVENT_BUTTON_CLICK = 'user.event.button_click',
    USER_EVENT_SEARCH = 'user.event.search',
    USER_EVENT_APPLICATION = 'user.event.application',
    USER_EVENT_FAVORITE = 'user.event.favorite',

    // 시스템 이벤트
    SYSTEM_NOTIFICATION = 'system.notification',
    SYSTEM_ALERT = 'system.alert',

    // AI 이미지 생성 (NestJS ↔ Python AI Agent 언어 경계 계약이라 버전을 붙인다)
    AI_IMAGE_REQUEST = 'ai-image.request.v1',
    AI_IMAGE_RESULT = 'ai-image.result.v1',
}

/**
 * 유저 이벤트 인터페이스
 */
export interface UserEvent {
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventData: Record<string, any>;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
}

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
    roomId: string;
    senderId: string;
    senderRole: 'adopter' | 'breeder';
    receiverId: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
    timestamp: Date;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private isConnected = false;
    private connectionAttempted = false;
    private reconnectTimer?: ReturnType<typeof setTimeout>;
    private connectPromise?: Promise<void>;
    private reconnectAttempt = 0;
    private outageNotified = false;
    private destroyed = false;

    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
        private readonly logger: CustomLoggerService,
        @Optional() private readonly notifyCriticalErrorUseCase?: NotifyCriticalErrorUseCase,
        @Optional() private readonly configService?: ConfigService,
    ) {}

    async onModuleInit() {
        if (!this.isKafkaEnabled()) {
            this.logger.logSuccess('KafkaService', 'Kafka 비활성 설정 확인 - 연결 생략');
            return;
        }

        await this.connect();
    }

    async onModuleDestroy() {
        this.destroyed = true;
        this.clearReconnectTimer();
        await this.connectPromise?.catch(() => undefined);
        await this.closeClient();
    }

    /**
     * 메시지 발행 (Producer)
     */
    async emit(topic: KafkaTopic, message: any): Promise<boolean> {
        if (!this.isConnected) {
            this.logger.logWarning('KafkaService', `Kafka 미연결 상태 - 메시지 스킵: ${topic}`, null);
            return false;
        }

        try {
            await lastValueFrom(
                this.kafkaClient.emit(topic, {
                    key: message.roomId || message.id || Date.now().toString(),
                    value: JSON.stringify(message),
                }),
            );
            this.logger.logDbOperation('KafkaService', 'emit', topic, { messageId: message.id });
            return true;
        } catch (error) {
            this.logger.logError('KafkaService', `메시지 발행 실패: ${topic}`, error);
            this.notifyKafkaCriticalError(`Kafka 메시지 발행 실패: ${topic}`, error, { topic });
            await this.closeClient();
            this.scheduleReconnect();
            return false;
        }
    }

    private async connect(): Promise<void> {
        if (this.destroyed || this.isConnected) return;
        if (this.connectPromise) return this.connectPromise;

        this.connectPromise = this.tryConnect().finally(() => {
            this.connectPromise = undefined;
        });
        return this.connectPromise;
    }

    private async tryConnect(): Promise<void> {
        this.connectionAttempted = true;
        try {
            // Producer 전용으로 사용하므로 subscribeToResponseOf 불필요
            // (request-reply 패턴이 아닌 emit 전용)
            await this.kafkaClient.connect();
            this.isConnected = true;
            this.reconnectAttempt = 0;
            this.outageNotified = false;
            this.logger.logSuccess('KafkaService', 'Kafka 브로커 연결 성공');
        } catch (error) {
            this.logger.warn(
                'Kafka 미연결 - HTTP/Socket.IO는 계속 제공하며 producer 재연결을 예약합니다',
                'KafkaService',
            );
            await this.closeClient();
            if (!this.outageNotified) {
                this.outageNotified = true;
                this.notifyKafkaCriticalError('Kafka 브로커 연결 실패', error);
            }
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.destroyed || this.isConnected || this.reconnectTimer || !this.isKafkaEnabled()) return;

        const delayMs = this.getReconnectIntervalMs();
        this.reconnectAttempt += 1;
        this.logger.logWarning(
            'KafkaService',
            `Kafka producer 재연결 예약 (${this.reconnectAttempt}회, ${delayMs}ms 후)`,
            null,
        );
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            void this.connect();
        }, delayMs);
        this.reconnectTimer.unref?.();
    }

    private getReconnectIntervalMs(): number {
        const configured = Number(this.configService?.get<string>('KAFKA_RECONNECT_INTERVAL_MS', '10000') ?? 10000);
        return Number.isFinite(configured) ? Math.max(1000, configured) : 10000;
    }

    private clearReconnectTimer(): void {
        if (!this.reconnectTimer) return;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
    }

    private isKafkaEnabled(): boolean {
        // 직접 생성하는 단위 테스트는 기존 연결 동작을 유지하고, Nest 런타임에서는
        // KAFKA_ENABLED를 producer와 consumer 양쪽에 동일하게 적용한다.
        if (!this.configService) {
            return true;
        }

        return this.configService.get<string>('KAFKA_ENABLED', 'false').toLowerCase() === 'true';
    }

    private async closeClient(): Promise<void> {
        if (!this.connectionAttempted) {
            return;
        }

        try {
            await this.kafkaClient.close();
            if (this.isConnected) {
                this.logger.logSuccess('KafkaService', 'Kafka 연결 종료');
            }
        } catch (error) {
            this.logger.logError('KafkaService', 'Kafka 연결 종료 실패', error);
        } finally {
            this.connectionAttempted = false;
            this.isConnected = false;
        }
    }

    /**
     * 운영 환경 Kafka 장애를 Discord critical 에러 알림으로 전달합니다.
     *
     * 로컬/테스트 환경에서는 Kafka를 일부러 끄는 경우가 많아 알림을 보내지 않습니다.
     */
    private notifyKafkaCriticalError(description: string, error: unknown, metadata?: Record<string, unknown>): void {
        if (!this.notifyCriticalErrorUseCase) {
            return;
        }

        // 로컬/테스트 환경에서는 알림을 보내지 않는다.
        // (개발자 로컬에서 prod webhook 을 사용하더라도 critical 채널 노이즈를 만들지 않게 차단)
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;

        void this.notifyCriticalErrorUseCase.execute({
            severity: 'critical',
            context: KafkaService.name,
            message: `${description}: ${errorMessage}`,
            stack,
            metadata,
        });
    }

    /**
     * 유저 플로우 이벤트 로깅
     */
    async logUserEvent(event: UserEvent): Promise<void> {
        const topic = this.getTopicForEventType(event.eventType);
        await this.emit(topic, {
            ...event,
            timestamp: event.timestamp || new Date(),
        });
    }

    /**
     * 채팅 메시지 발행
     */
    async sendChatMessage(message: ChatMessage): Promise<void> {
        await this.emit(KafkaTopic.CHAT_MESSAGE, {
            ...message,
            timestamp: message.timestamp || new Date(),
        });
    }

    /**
     * 이벤트 타입에 따른 토픽 결정
     */
    private getTopicForEventType(eventType: string): KafkaTopic {
        const topicMap: Record<string, KafkaTopic> = {
            page_view: KafkaTopic.USER_EVENT_PAGE_VIEW,
            button_click: KafkaTopic.USER_EVENT_BUTTON_CLICK,
            search: KafkaTopic.USER_EVENT_SEARCH,
            application: KafkaTopic.USER_EVENT_APPLICATION,
            favorite: KafkaTopic.USER_EVENT_FAVORITE,
        };

        return topicMap[eventType] || KafkaTopic.USER_EVENT_PAGE_VIEW;
    }

    /**
     * 연결 상태 확인
     */
    isKafkaConnected(): boolean {
        return this.isConnected;
    }
}
