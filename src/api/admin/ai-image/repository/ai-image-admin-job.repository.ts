import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AiImageJobStatus } from '../../../../common/enum/ai-image-job-status.enum';
import { AiImageJob, AiImageJobDocument } from '../../../../schema/ai-image-job.schema';

/** 어드민 생성 작업 조회 조건 (영속성 계층 표현) */
export interface AiImageAdminJobCriteria {
    status?: AiImageJobStatus;
    userId?: string;
    filterId?: string;
}

/** 생성 작업 읽기 전용 영속성 (어드민 모니터링) */
@Injectable()
export class AiImageAdminJobRepository {
    constructor(
        @InjectModel(AiImageJob.name)
        private readonly jobModel: Model<AiImageJobDocument>,
    ) {}

    findPaged(criteria: AiImageAdminJobCriteria, skip: number, limit: number): Promise<AiImageJobDocument[]> {
        return this.jobModel
            .find(this.toQuery(criteria))
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<AiImageJobDocument[]>()
            .exec();
    }

    count(criteria: AiImageAdminJobCriteria): Promise<number> {
        return this.jobModel.countDocuments(this.toQuery(criteria)).exec();
    }

    /**
     * 조건을 Mongo 쿼리로 변환한다.
     * 잘못된 ObjectId 는 무시하지 않고 매칭 불가 조건으로 바꿔, 조건 없이 전체가 나오는 사고를 막는다.
     */
    private toQuery(criteria: AiImageAdminJobCriteria): FilterQuery<AiImageJobDocument> {
        const query: FilterQuery<AiImageJobDocument> = {};

        if (criteria.status) query.status = criteria.status;
        if (criteria.userId) query.userId = criteria.userId;

        if (criteria.filterId) {
            query.filterId = Types.ObjectId.isValid(criteria.filterId)
                ? new Types.ObjectId(criteria.filterId)
                : new Types.ObjectId('000000000000000000000000');
        }

        return query;
    }
}
