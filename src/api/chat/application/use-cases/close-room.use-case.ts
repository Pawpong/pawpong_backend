import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { KafkaService, KafkaTopic } from '../../../../common/kafka/kafka.service';

@Injectable()
export class CloseRoomUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly kafkaService: KafkaService,
    ) {}

    async execute(userId: string, roomId: string): Promise<void> {
        const room = this.chatPolicyService.requireRoom(
            await this.chatRoomManager.findRoomById(roomId),
        );
        this.chatPolicyService.requireParticipant(room, userId);

        await this.chatRoomManager.closeRoom(roomId);

        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CLOSED, {
            roomId,
            closedBy: userId,
            timestamp: new Date(),
        });
    }
}
