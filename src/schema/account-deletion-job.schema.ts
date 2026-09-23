import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** 계정 삭제를 접수와 완료로 구분하고, 프로세스 종료 후에도 재시도할 수 있는 작업 기록. */
@Schema({ collection: 'account_deletion_jobs', timestamps: true })
export class AccountDeletionJob {
    @Prop({ required: true, unique: true }) requestId: string;
    @Prop({ required: true }) receiptHash: string;
    @Prop() accountId?: string;
    @Prop({ enum: ['adopter', 'breeder'] }) role?: 'adopter' | 'breeder';
    @Prop({
        required: true,
        enum: ['pending', 'processing', 'retryable', 'review_required', 'completed'],
        default: 'pending',
    })
    status: string;
    @Prop({ required: true }) requestedAt: Date;
    @Prop() completedAt?: Date;
    @Prop({ default: false }) appleConnectionRemovalRequired: boolean;
    @Prop({ default: false }) providerCompleted: boolean;
    @Prop({ default: false }) dataErased: boolean;
    @Prop({ type: Object }) plan?: Record<string, unknown>;
    @Prop({ default: 0 }) attempts: number;
    @Prop({ default: Date.now }) nextAttemptAt: Date;
    @Prop() leaseToken?: string;
    @Prop() leaseUntil?: Date;
    /** 상세 오류에는 파일명/인증정보가 포함될 수 있어 고정된 오류 코드만 저장한다. */
    @Prop() lastErrorCode?: string;
}
export const AccountDeletionJobSchema = SchemaFactory.createForClass(AccountDeletionJob);
AccountDeletionJobSchema.index(
    { accountId: 1, role: 1 },
    {
        unique: true,
        partialFilterExpression: { accountId: { $type: 'string' } },
    },
);
AccountDeletionJobSchema.index({ status: 1, nextAttemptAt: 1, leaseUntil: 1 });

/** 사용자 문서를 지우기 전에 객체 키를 보존한다. 실패 파일을 성공으로 표시하지 않는다. */
@Schema({ collection: 'account_deletion_files', timestamps: true })
export class AccountDeletionFile {
    @Prop({ required: true }) requestId: string;
    @Prop({ required: true }) objectKey: string;
    @Prop({ default: false }) deleted: boolean;
    @Prop({ default: true }) approvalRequired: boolean;
    @Prop() approvedAt?: Date;
    @Prop() notBefore?: Date;
}
export const AccountDeletionFileSchema = SchemaFactory.createForClass(AccountDeletionFile);
AccountDeletionFileSchema.index({ requestId: 1, objectKey: 1 }, { unique: true });
