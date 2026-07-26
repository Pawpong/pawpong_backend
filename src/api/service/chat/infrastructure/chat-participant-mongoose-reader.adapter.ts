import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { SenderRole } from '../../../../schema/chat-message.schema';
import { StorageService } from '../../../../common/storage/storage.service';
import {
    ChatParticipantProfileSnapshot,
    ChatParticipantReaderPort,
} from '../application/ports/chat-participant-reader.port';

@Injectable()
export class ChatParticipantMongooseReaderAdapter implements ChatParticipantReaderPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        private readonly storageService: StorageService,
    ) {}

    async findProfile(userId: string, role: SenderRole): Promise<ChatParticipantProfileSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;

        let user: { _id: Types.ObjectId; nickname?: string; name?: string; profileImageFileName?: string } | null;

        if (role === SenderRole.BREEDER) {
            user = await this.breederModel
                .findById(userId)
                .select({ nickname: 1, name: 1, profileImageFileName: 1 })
                .lean<{ _id: Types.ObjectId; nickname?: string; name?: string; profileImageFileName?: string }>()
                .exec();
        } else {
            user = await this.adopterModel
                .findById(userId)
                .select({ nickname: 1, profileImageFileName: 1 })
                .lean<{ _id: Types.ObjectId; nickname?: string; profileImageFileName?: string }>()
                .exec();
        }

        if (!user) return null;

        return {
            userId,
            role,
            nickname: user.name || user.nickname || '알 수 없음',
            profileImageUrl: this.storageService.generateSignedUrlSafe(user.profileImageFileName, 60),
        };
    }
}
