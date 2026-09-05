import { Inject, Injectable } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { ChatRoomResponseAssemblerService } from '../../domain/services/chat-room-response-assembler.service';
import type { ChatRoomResult } from '../types/chat-room-result.type';

@Injectable()
export class GetMyRoomsUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        private readonly chatRoomResponseAssembler: ChatRoomResponseAssemblerService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string): Promise<ChatRoomResult[]> {
        this.logger.logStart('getMyRooms', '내 채팅방 목록 조회 시작', { userId });

        try {
            const rooms = await this.chatRoomManager.findRoomsByParticipantId(userId);
            this.logger.logSuccess('getMyRooms', '내 채팅방 목록 조회 완료', { userId, count: rooms.length });
            return this.chatRoomResponseAssembler.toResults(rooms, userId);
        } catch (error) {
            this.logger.logError('getMyRooms', '내 채팅방 목록 조회', error);
            throw error;
        }
    }
}
