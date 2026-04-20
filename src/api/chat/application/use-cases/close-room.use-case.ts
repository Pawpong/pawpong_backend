import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import { CHAT_MESSAGE_BROKER, type ChatMessageBrokerPort } from '../ports/chat-message-broker.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

@Injectable()
export class CloseRoomUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_BROKER)
        private readonly chatMessageBroker: ChatMessageBrokerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, roomId: string): Promise<void> {
        this.logger.logStart('closeRoom', '채팅방 종료 시작', { userId, roomId });

        try {
            const room = this.chatPolicyService.requireRoom(
                await this.chatRoomManager.findRoomById(roomId),
            );
            this.chatPolicyService.requireParticipant(room, userId);

            await this.chatRoomManager.closeRoom(roomId);

            await this.chatMessageBroker.publishRoomClosed({
                roomId,
                closedBy: userId,
                timestamp: new Date(),
            });

            this.logger.logSuccess('closeRoom', '채팅방 종료 완료', { roomId });
        } catch (error) {
            this.logger.logError('closeRoom', '채팅방 종료', error);
            throw error;
        }
    }
}
