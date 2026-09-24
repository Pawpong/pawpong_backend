import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

/** Apple 자격 증명은 서비스 회원 응답에 섞이지 않는 별도 암호화 저장소에 둔다. */
@Schema({ collection: 'apple_credentials', timestamps: true })
export class AppleCredential {
    @Prop({ required: true, unique: true })
    subjectDigest: string;

    @Prop({ select: false })
    encryptedRefreshToken?: string;

    @Prop({ required: true, enum: ['available', 'revoking', 'revoked'], default: 'available' })
    state: 'available' | 'revoking' | 'revoked';

    @Prop({ type: String, enum: ['revoked', 'manual_disconnect_required'] })
    revocationStatus?: 'revoked' | 'manual_disconnect_required';

    // 삭제 직전 시작한 콜백이 토큰을 다시 저장하지 못하도록 짧은 차단 표식만 남긴다.
    @Prop()
    expiresAt?: Date;
}

export type AppleCredentialDocument = HydratedDocument<AppleCredential>;
export const AppleCredentialSchema = SchemaFactory.createForClass(AppleCredential);
AppleCredentialSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
