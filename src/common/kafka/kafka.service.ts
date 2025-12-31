import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CustomLoggerService } from '../logger/custom-logger.service';

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

    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
        private readonly logger: CustomLoggerService,
    ) {}

    async onModuleInit() {
        try {
            // 토픽 구독 (Consumer로 받을 토픽들)
            const topics = Object.values(KafkaTopic);
            topics.forEach((topic) => {
                this.kafkaClient.subscribeToResponseOf(topic);
            });

            await this.kafkaClient.connect();
            this.isConnected = true;
            this.logger.logSuccess('KafkaService', 'Kafka 브로커 연결 성공');
        } catch {
            // Kafka 미연결 시 간단한 경고만 출력 (선택적 기능이므로 앱은 계속 동작)
            this.logger.warn('Kafka 미연결 - 채팅/이벤트 로깅 비활성화 (docker compose up kafka 필요)', 'KafkaService');
            this.isConnected = false;
        }
    }

    async onModuleDestroy() {
        if (this.isConnected) {
            await this.kafkaClient.close();
            this.logger.logSuccess('KafkaService', 'Kafka 연결 종료');
        }
    }

    /**
     * 메시지 발행 (Producer)
     */
    async emit(topic: KafkaTopic, message: any): Promise<void> {
        if (!this.isConnected) {
            this.logger.logWarning('KafkaService', `Kafka 미연결 상태 - 메시지 스킵: ${topic}`, null);
            return;
        }

        try {
            this.kafkaClient.emit(topic, {
                key: message.id || Date.now().toString(),
                value: JSON.stringify(message),
            });
            this.logger.logDbOperation('KafkaService', 'emit', topic, { messageId: message.id });
        } catch (error) {
            this.logger.logError('KafkaService', `메시지 발행 실패: ${topic}`, error);
        }
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
