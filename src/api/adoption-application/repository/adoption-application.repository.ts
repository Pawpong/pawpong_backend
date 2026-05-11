import { ConflictException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { getErrorMessage, hasErrorCode } from '../../../common/utils/error.util';
import {
    AdoptionApplication,
    AdoptionApplicationDocument,
} from '../../../schema/adoption-application.schema';
import { Adopter } from '../../../schema/adopter.schema';
import type { AdopterDocument } from '../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { AdoptionApplicationPersistData } from '../application/types/adoption-application.type';

/** 이전 브랜치 commits 가 추가했던 partial unique index 이름. rollback 대상. */
const STALE_V2_UNIQUE_INDEX_NAME = 'uniq_adopter_pet_open_application_v2';

/**
 * v2 입양 신청 — Mongoose 직접 접근 캡슐화.
 */
@Injectable()
export class AdoptionApplicationRepository implements OnModuleInit {
    private readonly logger = new Logger(AdoptionApplicationRepository.name);

    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly applicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(AvailablePet.name)
        private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
    ) {}

    /**
     * 부트스트랩 시 이전 브랜치 commits 가 잠시 도입했다가 제거된 partial unique index 를 명시적으로
     * 정리한다. 운영 DB 에 도달했을 가능성이 있는 stale 인덱스는 v1 의 별개 중복 정책과 충돌하거나
     * 본 모듈이 더 이상 catch 하지 않는 E11000 을 raise 해 500 으로 surfacing 될 수 있다.
     * 인덱스가 없으면 'index not found' 로 흡수한다.
     */
    async onModuleInit(): Promise<void> {
        try {
            await this.applicationModel.collection.dropIndex(STALE_V2_UNIQUE_INDEX_NAME);
            this.logger.log(`Dropped stale index "${STALE_V2_UNIQUE_INDEX_NAME}"`);
        } catch (error) {
            const message = getErrorMessage(error);
            if (!/index not found|ns not found/i.test(message)) {
                this.logger.warn(
                    `Stale index cleanup skipped for "${STALE_V2_UNIQUE_INDEX_NAME}": ${message}`,
                );
            }
        }
    }

    /**
     * 신규 입양 신청 대상이 될 수 있는 분양 펫만 반환.
     * - isActive: true (소프트 삭제 제외)
     * - status: 'available' (reserved/adopted 는 신규 신청 불가)
     */
    async findApplicablePet(petId: string): Promise<AvailablePetDocument | null> {
        if (!Types.ObjectId.isValid(petId)) return null;
        return this.availablePetModel
            .findOne({ _id: new Types.ObjectId(petId), isActive: true, status: 'available' })
            .lean<AvailablePetDocument>()
            .exec();
    }

    async findAdopter(adopterId: string): Promise<AdopterDocument | null> {
        if (!Types.ObjectId.isValid(adopterId)) return null;
        return this.adopterModel
            .findById(adopterId)
            .select({ realName: 1, nickname: 1, emailAddress: 1, phoneNumber: 1 })
            .lean<AdopterDocument>()
            .exec();
    }

    /**
     * 동일 adopter × pet 의 처리 중 신청(consultation_pending/consultation_completed) 존재 여부.
     * 카운터/문서 페치 없이 가벼운 exists 사용.
     */
    async existsOpenApplicationForPet(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) return false;
        const found = await this.applicationModel.exists({
            adopterId: new Types.ObjectId(adopterId),
            petId: new Types.ObjectId(petId),
            status: { $in: ['consultation_pending', 'consultation_completed'] },
        });
        return Boolean(found);
    }

    /**
     * 신청 도큐먼트 생성.
     * 본 모듈은 unique index 를 명시적으로 도입하지 않지만, 이전 commits 에서 잠시 추가됐던 stale 인덱스가
     * 외부 환경(특히 이전 branch 가 적용된 운영/스테이징 DB)에 남아있을 가능성에 대비해 E11000 을
     * ConflictException 으로 흡수한다. 사용자 경험 측면에서 race 가 발생해도 500 이 아닌 409 를 보장.
     * onModuleInit 의 인덱스 drop 이 성공하면 이 가드는 무용이 되고, 실패하더라도 응답 계약은 유지된다.
     */
    async create(data: AdoptionApplicationPersistData): Promise<{ _id: string }> {
        try {
            const created = await this.applicationModel.create({
                ...data,
                breederId: new Types.ObjectId(data.breederId),
                adopterId: new Types.ObjectId(data.adopterId),
                petId: new Types.ObjectId(data.petId),
            });
            return { _id: String(created._id) };
        } catch (error) {
            if (hasErrorCode(error, 11000)) {
                throw new ConflictException('이미 처리 중인 상담 신청이 있습니다.');
            }
            throw error;
        }
    }
}
