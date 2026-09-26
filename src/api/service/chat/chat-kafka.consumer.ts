import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { ChatGateway } from './chat.gateway';
import { KafkaTopic } from '../../../common/kafka/kafka.service';

/**
 * 이보다 오래된 메시지는 실시간 전파하지 않는다.
 *
 * 인스턴스별 consumer group 이 커밋된 오프셋부터 이어 읽기 때문에, blue/green 교체로 쉬던 인스턴스가
 * 다시 뜨면 쉬는 동안 쌓인 메시지를 전부 new_message 로 다시 보낸다. 화면은 messageId 로 중복을 거르지만
 * 메시지마다 방 목록 재조회가 몰린다. 늦게 도착한 메시지는 클라이언트가 방 입장·재연결 때 이력으로 받는다.
 * ChatGateway 의 중복 전파 방지 창(60초)과 같은 기준을 쓴다.
 */
export const CHAT_BROADCAST_MAX_AGE_MS = 60_000;

/** Kafka 를 거치며 createdAt 은 ISO 문자열로 온다 */
type ChatBroadcastMessage = Parameters<ChatGateway['broadcastNewMessage']>[0];

/**
 * 채팅 Kafka Consumer
 *
 * chat.message 토픽을 구독하여 WebSocket 브로드캐스트를 담당한다.
 *
 * [흐름]
 * 클라이언트 → WebSocket send_message
 *   → ChatGateway: DB 저장 + Kafka emit
 *   → (Kafka) → ChatKafkaConsumer.handleChatMessage()
 *   → ChatGateway.broadcastNewMessage()
 *   → 채팅방의 모든 클라이언트에게 new_message 전달
 *
 * [다중 서버 스케일링]
 * 서버가 여러 대일 때 각 인스턴스의 Consumer가 동일 메시지를 수신하여
 * 각자 연결된 WebSocket 클라이언트에게 전달하므로 누락이 없음.
 */
@Controller()
export class ChatKafkaConsumer {
    constructor(private readonly chatGateway: ChatGateway) {}

    @EventPattern(KafkaTopic.CHAT_MESSAGE)
    async handleChatMessage(@Payload() payload: unknown): Promise<void> {
        const message = (typeof payload === 'string' ? JSON.parse(payload) : payload) as ChatBroadcastMessage;
        if (isStale(message?.createdAt, Date.now())) return;
        await this.chatGateway.broadcastNewMessage(message);
    }
}

/** 작성 시각을 알 수 없으면 판단하지 않고 전파한다 (누락보다 중복이 낫다) */
function isStale(createdAt: unknown, now: number): boolean {
    if (typeof createdAt !== 'string' && !(createdAt instanceof Date)) return false;
    const writtenAt = new Date(createdAt).getTime();
    if (Number.isNaN(writtenAt)) return false;
    return now - writtenAt > CHAT_BROADCAST_MAX_AGE_MS;
}
