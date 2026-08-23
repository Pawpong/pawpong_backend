import { Inject, Injectable } from '@nestjs/common';

import { CHAT_USER_BLOCK_MANAGER, type ChatUserBlockManagerPort } from '../ports/chat-user-block-manager.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';

@Injectable()
export class UnblockChatUserUseCase {
    constructor(
        @Inject(CHAT_USER_BLOCK_MANAGER)
        private readonly blockManager: ChatUserBlockManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
    ) {}

    async execute(blockerId: string, blockedUserId: string): Promise<void> {
        this.chatPolicyService.requireDifferentUsers(blockerId, blockedUserId);
        await this.blockManager.unblockUser(blockerId, blockedUserId);
    }
}
