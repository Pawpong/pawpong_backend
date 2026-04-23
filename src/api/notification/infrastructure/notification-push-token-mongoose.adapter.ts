import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type {
    NotificationPushTokenStorePort,
    RegisterPushDeviceTokenCommand,
    UnregisterPushDeviceTokenCommand,
    UserPushDeviceTokens,
} from '../application/ports/notification-push-token-store.port';
import type { NotificationUserRole } from '../application/ports/notification-command.port';

interface StoredPushDeviceToken {
    token: string;
    platform: string;
    registeredAt?: Date;
    appVersion?: string;
}

interface PushTokenOwnerDocument {
    pushDeviceTokens?: StoredPushDeviceToken[];
}

/**
 * adopter/breeder 모델의 pushDeviceTokens 배열을 다루는 어댑터.
 *
 * - 등록: 동일 토큰이 있으면 pull 후 재삽입해 registeredAt 갱신
 * - 해제: 토큰 배열에서 pull
 * - 무효 정리: FCM 발송 실패 시 배열에서 pull (여러 토큰 일괄)
 * - 조회: 토큰 문자열만 꺼내 반환 (중복 제거)
 *
 * adopter/breeder 두 구체 모델을 공통 Model 타입으로 묶기 위해
 * pushDeviceTokens 필드만 알고 있는 PushTokenOwnerDocument 로 캐스트한다.
 */
@Injectable()
export class NotificationPushTokenMongooseAdapter implements NotificationPushTokenStorePort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async register(command: RegisterPushDeviceTokenCommand): Promise<void> {
        const now = new Date();
        const model = this.resolveModel(command.userRole);

        // 같은 토큰이 있으면 제거 후 재삽입해 registeredAt 갱신
        await model
            .updateOne({ _id: command.userId }, { $pull: { pushDeviceTokens: { token: command.token } } })
            .exec();

        await model
            .updateOne(
                { _id: command.userId },
                {
                    $push: {
                        pushDeviceTokens: {
                            token: command.token,
                            platform: command.platform,
                            registeredAt: now,
                            appVersion: command.appVersion,
                        },
                    },
                },
            )
            .exec();
    }

    async unregister(command: UnregisterPushDeviceTokenCommand): Promise<void> {
        const model = this.resolveModel(command.userRole);
        await model
            .updateOne({ _id: command.userId }, { $pull: { pushDeviceTokens: { token: command.token } } })
            .exec();
    }

    async purgeInvalidTokens(userId: string, userRole: NotificationUserRole, tokens: string[]): Promise<void> {
        if (tokens.length === 0) return;
        const model = this.resolveModel(userRole);
        await model
            .updateOne({ _id: userId }, { $pull: { pushDeviceTokens: { token: { $in: tokens } } } })
            .exec();
    }

    async findTokensByUser(userId: string, userRole: NotificationUserRole): Promise<UserPushDeviceTokens> {
        const model = this.resolveModel(userRole);
        const doc = await model.findById(userId).select('pushDeviceTokens').lean<PushTokenOwnerDocument | null>().exec();

        const raw = doc?.pushDeviceTokens ?? [];
        const tokens = Array.from(
            new Set(raw.map((entry) => entry.token).filter((token): token is string => !!token)),
        );

        return { userId, userRole, tokens };
    }

    private resolveModel(role: NotificationUserRole): Model<PushTokenOwnerDocument> {
        const model = role === 'adopter' ? this.adopterModel : this.breederModel;
        return model as unknown as Model<PushTokenOwnerDocument>;
    }
}
