import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

/** 심사 로그인 자격 증명은 공개 프로필 모델과 분리한다. 각 서비스 역할당 한 계정만 허용한다. */
@Schema({ collection: 'review_credentials', timestamps: true })
export class ReviewCredential {
    @Prop({ required: true, lowercase: true, trim: true })
    emailAddress: string;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
    accountId: Types.ObjectId;

    @Prop({ required: true, enum: ['adopter', 'breeder'] })
    role: 'adopter' | 'breeder';

    @Prop({ required: true, select: false })
    passwordHash: string;

    @Prop({ required: true, default: true })
    enabled: boolean;

    @Prop({ required: true })
    provisionedBy: string;
}

export type ReviewCredentialDocument = HydratedDocument<ReviewCredential>;
export const ReviewCredentialSchema = SchemaFactory.createForClass(ReviewCredential);
ReviewCredentialSchema.index({ emailAddress: 1 }, { unique: true });
ReviewCredentialSchema.index({ role: 1 }, { unique: true });
ReviewCredentialSchema.index({ accountId: 1, role: 1 }, { unique: true });
// 명시적으로 hash를 조회한 인증 코드에서도 document 전체를 직렬화하면 hash가 노출되지 않는다.
for (const option of ['toJSON', 'toObject'] as const) {
    ReviewCredentialSchema.set(option, {
        transform: (_document, result) => {
            delete (result as unknown as Record<string, unknown>).passwordHash;
            return result;
        },
    });
}
