import { Inject, Injectable } from '@nestjs/common';

import { CHAT_USER_BLOCK_MANAGER, type ChatUserBlockManagerPort } from '../ports/chat-user-block-manager.port';
import { CHAT_PARTICIPANT_READER, type ChatParticipantReaderPort } from '../ports/chat-participant-reader.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';

@Injectable()
export class BlockChatUserUseCase {
    constructor(
        @Inject(CHAT_USER_BLOCK_MANAGER)
        private readonly blockManager: ChatUserBlockManagerPort,
        @Inject(CHAT_PARTICIPANT_READER)
        private readonly participantReader: ChatParticipantReaderPort,
        private readonly chatPolicyService: ChatPolicyService,
    ) {}

    async execute(blockerId: string, blockedUserId: string): Promise<void> {
        this.chatPolicyService.requireDifferentUsers(blockerId, blockedUserId);
        this.chatPolicyService.requireProfile(await this.participantReader.findParticipant(blockedUserId));
        await this.blockManager.blockUser(blockerId, blockedUserId);
    }
}
