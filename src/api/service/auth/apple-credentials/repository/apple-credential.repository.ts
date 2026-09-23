import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppleCredential } from '../../../../../schema/apple-credential.schema';
import type { AppleCredentialPort, AppleStoredCredential } from '../application/apple-credential.port';

@Injectable()
export class AppleCredentialRepository implements AppleCredentialPort {
    constructor(@InjectModel(AppleCredential.name) private readonly model: Model<AppleCredential>) {}

    /** 삭제가 시작된 토큰은 늦게 도착한 로그인 응답으로 덮어쓰지 않는다. */
    async save(subjectDigest: string, encryptedRefreshToken: string): Promise<void> {
        try {
            await this.model
                .updateOne(
                    { subjectDigest, state: 'available' },
                    { $set: { encryptedRefreshToken }, $setOnInsert: { subjectDigest, state: 'available' } },
                    { upsert: true },
                )
                .exec();
        } catch (error) {
            if ((error as { code?: number }).code === 11000) {
                throw new UnauthorizedException('계정 삭제 처리 중입니다. 잠시 후 다시 시도해주세요.');
            }
            throw error;
        }
    }

    /** 토큰 유무와 무관하게 먼저 콜백의 재저장을 차단한다. 재시도에도 같은 토큰을 반환한다. */
    async lockForRevocation(subjectDigest: string): Promise<AppleStoredCredential> {
        const row = await this.model
            .findOneAndUpdate(
                { subjectDigest },
                { $setOnInsert: { subjectDigest, state: 'revoking' } },
                { upsert: true, new: true },
            )
            .select('+encryptedRefreshToken')
            .lean()
            .exec();
        if (row.state === 'available') {
            // save와 경쟁하면 갱신 후의 최신 토큰을 반환해야 한다.
            const locked = await this.model
                .findOneAndUpdate({ subjectDigest, state: 'available' }, { $set: { state: 'revoking' } }, { new: true })
                .select('+encryptedRefreshToken')
                .lean()
                .exec();
            if (locked) return locked;
            // 다른 worker가 이미 폐기를 끝냈다면 완료 상태를 다시 revoking으로 바꾸지 않는다.
            const latest = await this.model.findOne({ subjectDigest }).select('+encryptedRefreshToken').lean().exec();
            if (!latest) throw new Error('Apple credential revocation state is unavailable');
            return latest;
        }
        return row;
    }

    /** 외부 연결 해제 성공 후 암호문을 제거하고 단기 경쟁 방지 표식만 유지한다. */
    async finishRevocation(subjectDigest: string, status: 'revoked' | 'manual_disconnect_required'): Promise<void> {
        await this.model
            .updateOne(
                { subjectDigest },
                {
                    $set: { state: 'revoked', revocationStatus: status, expiresAt: new Date(Date.now() + 15 * 60_000) },
                    $unset: { encryptedRefreshToken: 1 },
                },
            )
            .exec();
    }
}
