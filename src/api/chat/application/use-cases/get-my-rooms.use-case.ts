import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort, type ChatRoomSnapshot } from '../ports/chat-room-manager.port';
import { SenderRole } from '../../../../schema/chat-message.schema';

@Injectable()
export class GetMyRoomsUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
    ) {}

    async execute(userId: string, role: SenderRole): Promise<ChatRoomSnapshot[]> {
        if (role === SenderRole.ADOPTER) {
            return this.chatRoomManager.findRoomsByAdopterId(userId);
        }
        return this.chatRoomManager.findRoomsByBreederId(userId);
    }
}
