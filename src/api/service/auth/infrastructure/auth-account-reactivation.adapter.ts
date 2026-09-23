import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DomainAuthenticationError } from '../../../../common/error/domain.error';

import { UserStatus } from '../../../../common/enum/user.enum';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';

import type {
    AuthAccountReactivationPort,
    AuthReactivationAccount,
} from '../application/ports/auth-account-reactivation.port';
import { type AuthSessionRole } from '../application/ports/auth-session.port';

/** 탈퇴 표시를 걷어내기 위해 제거해야 하는 필드 */
const WITHDRAWAL_FIELDS = {
    deletedAt: '',
    deleteReason: '',
    deleteReasonDetail: '',
} as const;

@Injectable()
export class AuthAccountReactivationAdapter implements AuthAccountReactivationPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findById(userId: string, role: AuthSessionRole): Promise<AuthReactivationAccount | null> {
        if (role === 'adopter') {
            const adopter = await this.adopterModel.findById(userId).exec();
            if (!adopter) return null;

            return {
                userId: adopter._id.toString(),
                email: adopter.emailAddress,
                name: adopter.nickname || adopter.emailAddress,
                role: 'adopter',
                accountStatus: adopter.accountStatus,
                permanentDeletionRequestedAt: adopter.permanentDeletionRequestedAt,
                profileImage: adopter.profileImageFileName ?? undefined,
            };
        }

        const breeder = await this.breederModel.findById(userId).exec();
        if (!breeder) return null;

        return {
            userId: breeder._id.toString(),
            email: breeder.emailAddress,
            name: breeder.name || breeder.nickname || breeder.emailAddress,
            role: 'breeder',
            accountStatus: breeder.accountStatus,
            permanentDeletionRequestedAt: breeder.permanentDeletionRequestedAt,
            profileImage: breeder.profileImageFileName ?? undefined,
        };
    }

    async reactivate(userId: string, role: AuthSessionRole): Promise<void> {
        // findByIdAndUpdate 는 undefined 필드를 무시하므로 탈퇴 필드는 $unset 으로 지운다.
        const update = {
            $set: { accountStatus: UserStatus.ACTIVE, updatedAt: new Date() },
            $unset: WITHDRAWAL_FIELDS,
        };

        const filter = {
            _id: userId,
            accountStatus: UserStatus.DELETED,
            permanentDeletionRequestedAt: { $exists: false },
        };
        const result =
            role === 'adopter'
                ? await this.adopterModel.updateOne(filter, update).exec()
                : await this.breederModel.updateOne(filter, update).exec();
        if (result.matchedCount !== 1) throw new DomainAuthenticationError('복구할 수 없는 계정입니다.');
    }
}
