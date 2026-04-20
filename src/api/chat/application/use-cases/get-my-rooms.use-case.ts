import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort, type ChatRoomSnapshot } from '../ports/chat-room-manager.port';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { SenderRole } from '../../../../schema/chat-message.schema';

@Injectable()
export class GetMyRoomsUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, role: SenderRole): Promise<ChatRoomSnapshot[]> {
        this.logger.logStart('getMyRooms', '내 채팅방 목록 조회 시작', { userId, role });

        try {
            const rooms =
                role === SenderRole.ADOPTER
                    ? await this.chatRoomManager.findRoomsByAdopterId(userId)
                    : await this.chatRoomManager.findRoomsByBreederId(userId);

            this.logger.logSuccess('getMyRooms', '내 채팅방 목록 조회 완료', { userId, count: rooms.length });
            return rooms;
        } catch (error) {
            this.logger.logError('getMyRooms', '내 채팅방 목록 조회', error);
            throw error;
        }
    }
}
