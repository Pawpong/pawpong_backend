import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { ChatGateway } from './chat.gateway';
import { KafkaTopic } from '../../common/kafka/kafka.service';

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
    handleChatMessage(@Payload() payload: any): void {
        const message = typeof payload === 'string' ? JSON.parse(payload) : payload;
        this.chatGateway.broadcastNewMessage(message);
    }
}
