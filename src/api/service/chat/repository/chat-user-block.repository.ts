import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChatUserBlock, ChatUserBlockDocument } from '../../../../schema/chat-user-block.schema';

@Injectable()
export class ChatUserBlockRepository {
    constructor(
        @InjectModel(ChatUserBlock.name)
        private readonly chatUserBlockModel: Model<ChatUserBlockDocument>,
    ) {}

    async isBlockedBetween(firstUserId: string, secondUserId: string): Promise<boolean> {
        return Boolean(
            await this.chatUserBlockModel
                .exists({
                    $or: [
                        { blockerId: firstUserId, blockedUserId: secondUserId },
                        { blockerId: secondUserId, blockedUserId: firstUserId },
                    ],
                })
                .exec(),
        );
    }

    async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
        await this.chatUserBlockModel.updateOne(
            { blockerId, blockedUserId },
            { $setOnInsert: { blockerId, blockedUserId } },
            { upsert: true },
        );
    }

    async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
        await this.chatUserBlockModel.deleteOne({ blockerId, blockedUserId });
    }
}
