import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { SenderRole } from '../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../common/enum/user.enum';
import { StorageService } from '../../../../common/storage/storage.service';
import {
    ChatParticipantProfileSnapshot,
    ChatParticipantReaderPort,
} from '../application/ports/chat-participant-reader.port';

type ParticipantRecord = {
    _id: Types.ObjectId;
    nickname?: string;
    name?: string;
    profileImageFileName?: string;
    accountStatus?: UserStatus;
};

@Injectable()
export class ChatParticipantMongooseReaderAdapter implements ChatParticipantReaderPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        private readonly storageService: StorageService,
    ) {}

    async findParticipant(userId: string, role?: SenderRole): Promise<ChatParticipantProfileSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;

        if (role) {
            const user = await this.findByRole(userId, role);
            return user ? this.toSnapshot(userId, role, user) : null;
        }

        const [adopter, breeder] = await Promise.all([
            this.findByRole(userId, SenderRole.ADOPTER),
            this.findByRole(userId, SenderRole.BREEDER),
        ]);
        if (adopter) return this.toSnapshot(userId, SenderRole.ADOPTER, adopter);
        if (breeder) return this.toSnapshot(userId, SenderRole.BREEDER, breeder);
        return null;
    }

    private async findByRole(userId: string, role: SenderRole): Promise<ParticipantRecord | null> {
        const projection = { nickname: 1, name: 1, profileImageFileName: 1, accountStatus: 1 };
        if (role === SenderRole.BREEDER) {
            return this.breederModel.findById(userId).select(projection).lean<ParticipantRecord>().exec();
        }
        return this.adopterModel.findById(userId).select(projection).lean<ParticipantRecord>().exec();
    }

    private toSnapshot(userId: string, role: SenderRole, user: ParticipantRecord): ChatParticipantProfileSnapshot {
        const accountStatus = user.accountStatus ?? UserStatus.ACTIVE;
        const isDeleted = accountStatus === UserStatus.DELETED;
        return {
            userId,
            role,
            nickname: isDeleted ? '탈퇴한 사용자' : user.name || user.nickname || '알 수 없음',
            profileImageUrl: isDeleted
                ? undefined
                : this.storageService.generateSignedUrlSafe(user.profileImageFileName, 60),
            accountStatus,
        };
    }
}
