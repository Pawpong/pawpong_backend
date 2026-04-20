import { Injectable } from '@nestjs/common';

import { KafkaService, KafkaTopic } from '../../../common/kafka/kafka.service';
import {
    ChatMessageBrokerPayload,
    ChatMessageBrokerPort,
    ChatRoomLifecyclePayload,
} from '../application/ports/chat-message-broker.port';

@Injectable()
export class KafkaChatMessageBrokerAdapter implements ChatMessageBrokerPort {
    constructor(private readonly kafkaService: KafkaService) {}

    async publishMessage(payload: ChatMessageBrokerPayload): Promise<void> {
        await this.kafkaService.emit(KafkaTopic.CHAT_MESSAGE, payload);
    }

    async publishRoomCreated(payload: ChatRoomLifecyclePayload): Promise<void> {
        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CREATED, payload);
    }

    async publishRoomClosed(payload: ChatRoomLifecyclePayload): Promise<void> {
        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CLOSED, payload);
    }
}
