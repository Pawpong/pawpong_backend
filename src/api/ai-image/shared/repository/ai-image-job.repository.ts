import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AI_IMAGE_JOB_IN_PROGRESS_STATUSES, AiImageJobStatus } from '../../../../common/enum/ai-image-job-status.enum';
import { AiImageJob, AiImageJobDocument } from '../../../../schema/ai-image-job.schema';

/** 생성 작업 영속성. 상태 전이는 모두 조건부 원자 업데이트로 수행한다. */
@Injectable()
export class AiImageJobRepository {
    constructor(
        @InjectModel(AiImageJob.name)
        private readonly jobModel: Model<AiImageJobDocument>,
    ) {}

    async create(data: Record<string, unknown>): Promise<AiImageJobDocument> {
        const created = await this.jobModel.create(data);
        return created.toObject() as AiImageJobDocument;
    }

    findById(jobId: string): Promise<AiImageJobDocument | null> {
        if (!Types.ObjectId.isValid(jobId)) return Promise.resolve(null);
        return this.jobModel.findById(jobId).lean<AiImageJobDocument>().exec();
    }

    findByUserId(userId: string, limit: number): Promise<AiImageJobDocument[]> {
        return this.jobModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean<AiImageJobDocument[]>()
            .exec();
    }

    /**
     * 사용자·콘테스트별 생성 횟수.
     * 실패한 작업은 쿼터에서 제외해 사용자가 손해보지 않게 한다.
     */
    countByUserAndContest(userId: string, contestId: string | null): Promise<number> {
        return this.jobModel
            .countDocuments({
                userId,
                contestId: contestId ? new Types.ObjectId(contestId) : null,
                status: { $ne: AiImageJobStatus.FAILED },
            })
            .exec();
    }

    /**
     * 진행 중 상태일 때만 전이. 이미 종결된 작업이면 null 을 반환한다.
     * 결과 메시지가 중복 도착해도 최초 1회만 반영되도록 하는 멱등성의 핵심.
     */
    transitionIfInProgress(
        jobId: string,
        update: Record<string, unknown>,
    ): Promise<AiImageJobDocument | null> {
        if (!Types.ObjectId.isValid(jobId)) return Promise.resolve(null);
        return this.jobModel
            .findOneAndUpdate(
                { _id: new Types.ObjectId(jobId), status: { $in: AI_IMAGE_JOB_IN_PROGRESS_STATUSES } },
                { $set: update },
                { new: true },
            )
            .lean<AiImageJobDocument>()
            .exec();
    }
}
