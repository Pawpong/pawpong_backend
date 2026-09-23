import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter } from '../../../schema/adopter.schema';
import { Breeder } from '../../../schema/breeder.schema';
import { PushDevice } from '../../../schema/push-device.schema';
import type { AccountAccessRevokedEvent } from '../account-access-revoked.event';

@Injectable()
export class AccountAccessRepository {
    constructor(
        @InjectModel(Adopter.name) private readonly adopters: Model<Adopter>,
        @InjectModel(Breeder.name) private readonly breeders: Model<Breeder>,
        @InjectModel(PushDevice.name) private readonly devices: Model<PushDevice>,
    ) {}

    /** 복구 뒤에도 이전 세션과 기기 등록이 되살아나지 않도록 제거한다. */
    async revoke({ userId, role }: AccountAccessRevokedEvent): Promise<void> {
        const filter = { _id: userId };
        const update = { $unset: { refreshToken: '' }, $set: { pushDeviceTokens: [] } };
        if (role === 'adopter') await this.adopters.updateOne(filter, update);
        else await this.breeders.updateOne(filter, update);
        // 익명 기기로 바꾸면 전체 기기 발송에 다시 포함되므로 소유 등록 자체를 지운다.
        // 계정 전환이 먼저 끝난 기기는 새 소유자의 것이므로 삭제하지 않는다.
        await this.devices.deleteMany({ userId, userRole: role });
    }
}
