import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PushDevice } from '../../../../schema/push-device.schema';

/**
 * 기기 등록 결과.
 * 이번 호출로 새로 만들어진 기기인지 알려준다 — 설치 직후 안내 푸시를 한 번만 보내기 위함.
 */
export interface PushDeviceUpsertResult {
    isNewDevice: boolean;
}

@Injectable()
export class PushDeviceRepository {
    constructor(@InjectModel(PushDevice.name) private readonly pushDeviceModel: Model<PushDevice>) {}

    /**
     * 기기를 등록하거나 마지막 접속 시각을 갱신한다.
     * 계정 바인딩(userId/userRole)은 건드리지 않는다 — 로그인 여부와 무관한 호출이기 때문이다.
     */
    async upsertDevice(token: string, platform?: string, appVersion?: string): Promise<PushDeviceUpsertResult> {
        const result = await this.pushDeviceModel.updateOne(
            { token },
            {
                $set: {
                    lastSeenAt: new Date(),
                    ...(platform ? { platform } : {}),
                    ...(appVersion ? { appVersion } : {}),
                },
                $setOnInsert: { token, userId: null, userRole: null, welcomeSent: false },
            },
            { upsert: true },
        );

        return { isNewDevice: result.upsertedCount > 0 };
    }

    /**
     * 기기를 계정에 바인딩한다.
     * 같은 토큰이 다른 계정에 묶여 있었다면 덮어쓴다 — 디바이스 1대는 마지막 로그인 계정 1명에게 속한다.
     */
    async bindToUser(token: string, userId: string, userRole: string): Promise<void> {
        await this.pushDeviceModel.updateOne(
            { token },
            {
                $set: { userId, userRole, lastSeenAt: new Date() },
                $setOnInsert: { token, welcomeSent: false },
            },
            { upsert: true },
        );
    }

    /**
     * 로그아웃 시 바인딩만 해제한다. 기기 레코드는 남겨 재로그인 시 다시 묶을 수 있게 한다.
     */
    async unbind(token: string): Promise<void> {
        await this.pushDeviceModel.updateOne({ token }, { $set: { userId: null, userRole: null } });
    }

    /**
     * 안내 푸시 발송 완료 표시. 실제 발송이 성공한 뒤에만 호출한다.
     */
    async markWelcomeSent(token: string): Promise<void> {
        await this.pushDeviceModel.updateOne({ token }, { $set: { welcomeSent: true } });
    }

    /**
     * FCM이 무효로 판정한 토큰 제거.
     */
    async removeTokens(tokens: string[]): Promise<void> {
        if (tokens.length === 0) return;
        await this.pushDeviceModel.deleteMany({ token: { $in: tokens } });
    }
}
