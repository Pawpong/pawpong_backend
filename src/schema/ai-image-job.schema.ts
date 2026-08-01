import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { AiImageJobStatus } from '../common/enum/ai-image-job-status.enum';

export type AiImageJobDocument = AiImageJob &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * AI 이미지 생성 작업.
 *
 * 상태 흐름: PENDING → QUEUED → PROCESSING → SUCCEEDED | FAILED
 * - PENDING: Job 도큐먼트 생성됨 (아직 큐 발행 전)
 * - QUEUED: Kafka 요청 토픽 발행 완료
 * - PROCESSING: AI Agent 가 처리 시작
 * - SUCCEEDED/FAILED: 종료 상태 (더 이상 전이 없음 — 결과 메시지 중복 수신 시 무시)
 *
 * 프롬프트/모델은 생성 시점의 필터 값을 스냅샷으로 복사한다.
 * 관리자가 나중에 필터를 수정해도 진행 중 작업의 결과가 흔들리지 않게 하기 위함이다.
 */
@Schema({ timestamps: true, collection: 'ai_image_jobs' })
export class AiImageJob {
    /** 요청한 사용자 ID */
    @Prop({ required: true, index: true })
    userId: string;

    /** 요청 시점의 사용자 역할 (콘테스트 출품 시 스냅샷 조회에 사용) */
    @Prop({ type: String, enum: ['adopter', 'breeder'], required: true })
    userRole: 'adopter' | 'breeder';

    /** 대상 콘테스트 (생성 쿼터 산정 기준). 콘테스트 무관 생성이면 null */
    @Prop({ type: Types.ObjectId, ref: 'Contest', default: null, index: true })
    contestId: Types.ObjectId | null;

    /** 사용한 필터 */
    @Prop({ type: Types.ObjectId, ref: 'AiImageFilter', required: true })
    filterId: Types.ObjectId;

    /** 사용자가 업로드한 원본 사진 S3 파일키 */
    @Prop({ required: true })
    inputObjectKey: string;

    /** 생성 결과 S3 파일키 (성공 시에만 채워짐) */
    @Prop({ type: String, default: null })
    outputObjectKey: string | null;

    @Prop({
        type: String,
        enum: Object.values(AiImageJobStatus),
        default: AiImageJobStatus.PENDING,
        index: true,
    })
    status: AiImageJobStatus;

    /** 생성 시점 필터 프롬프트 스냅샷 */
    @Prop({ required: true })
    promptSnapshot: string;

    /** 생성 시점 제외 프롬프트 스냅샷 */
    @Prop({ default: '' })
    negativePromptSnapshot: string;

    /** 생성 시점 모델 스냅샷 */
    @Prop({ required: true })
    modelSnapshot: string;

    /** 생성 시점 출력 크기 스냅샷 */
    @Prop({ default: '1024x1024' })
    outputSizeSnapshot: string;

    /** 시도 횟수 (관리자 재시도 시 증가) */
    @Prop({ default: 1 })
    attempt: number;

    /** 실패 사유 코드 (예: QUEUE_UNAVAILABLE, OPENAI_GENERATION_FAILED) */
    @Prop({ type: String, default: null })
    errorCode: string | null;

    /** 종료(성공/실패) 시각 */
    @Prop({ type: Date, default: null })
    completedAt: Date | null;
}

export const AiImageJobSchema = SchemaFactory.createForClass(AiImageJob);

/** 사용자·콘테스트별 생성 횟수 산정 (쿼터 체크) */
AiImageJobSchema.index({ userId: 1, contestId: 1 });

/** 내 생성 목록 최신순 */
AiImageJobSchema.index({ userId: 1, createdAt: -1 });
