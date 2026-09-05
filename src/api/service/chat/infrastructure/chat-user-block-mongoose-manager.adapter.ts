import { Injectable } from '@nestjs/common';

import { ChatUserBlockManagerPort } from '../application/ports/chat-user-block-manager.port';
import { ChatUserBlockRepository } from '../repository/chat-user-block.repository';

@Injectable()
export class ChatUserBlockMongooseManagerAdapter implements ChatUserBlockManagerPort {
    constructor(private readonly repository: ChatUserBlockRepository) {}

    isBlockedBetween(firstUserId: string, secondUserId: string): Promise<boolean> {
        return this.repository.isBlockedBetween(firstUserId, secondUserId);
    }

    blockUser(blockerId: string, blockedUserId: string): Promise<void> {
        return this.repository.blockUser(blockerId, blockedUserId);
    }

    unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
        return this.repository.unblockUser(blockerId, blockedUserId);
    }
}
