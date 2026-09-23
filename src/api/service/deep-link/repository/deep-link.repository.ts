import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeepLink, DeepLinkDocument } from '../../../../schema/deep-link.schema';
import { DomainConflictError, DomainValidationError } from '../../../../common/error/domain.error';
import type { DeepLinkRecord, DeepLinkValues, PublicDeepLink } from '../application/types/deep-link.type';

/** 동일 슬러그의 동시 생성도 DB 고유 인덱스로 차단한다. */
@Injectable()
export class DeepLinkRepository {
    constructor(@InjectModel(DeepLink.name) private readonly model: Model<DeepLink>) {}

    /** 활성 링크만 공개한다. */
    async findActiveBySlug(slug: string): Promise<PublicDeepLink | null> {
        const doc = await this.model.findOne({ slug, isActive: true }).exec();
        if (!doc) return null;
        return {
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            targetPath: doc.targetPath,
            imageUrl: doc.imageUrl,
        };
    }

    /** 최신순으로 관리자 목록과 총 개수를 조회한다. */
    async list(page: number, limit: number): Promise<{ items: DeepLinkRecord[]; totalItems: number }> {
        const [docs, totalItems] = await Promise.all([
            this.model
                .find()
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.model.countDocuments().exec(),
        ]);
        return { items: docs.map((doc) => this.toRecord(doc)), totalItems };
    }

    /** 수정 전에 현재 값을 읽어 생략된 필드를 보존한다. */
    async findById(id: string): Promise<DeepLinkRecord | null> {
        this.ensureId(id);
        const doc = await this.model.findById(id).exec();
        return doc ? this.toRecord(doc) : null;
    }

    /** 검증된 링크를 저장한다. */
    async create(values: DeepLinkValues): Promise<DeepLinkRecord> {
        try {
            return this.toRecord(await this.model.create(values));
        } catch (error) {
            this.rethrowConflict(error);
        }
    }

    /** 검증된 필드만 변경한다. */
    async update(id: string, values: DeepLinkValues): Promise<DeepLinkRecord | null> {
        this.ensureId(id);
        try {
            const doc = await this.model
                .findByIdAndUpdate(id, { $set: values }, { new: true, runValidators: true })
                .exec();
            return doc ? this.toRecord(doc) : null;
        } catch (error) {
            this.rethrowConflict(error);
        }
    }

    /** 삭제 후 공개 조회에서도 즉시 사라진다. */
    async delete(id: string): Promise<boolean> {
        this.ensureId(id);
        return !!(await this.model.findByIdAndDelete(id).exec());
    }

    private ensureId(id: string): void {
        if (!Types.ObjectId.isValid(id)) throw new DomainValidationError('링크 ID가 올바르지 않습니다.');
    }

    private rethrowConflict(error: unknown): never {
        if ((error as { code?: number })?.code === 11000) throw new DomainConflictError('이미 사용 중인 슬러그입니다.');
        throw error;
    }

    private toRecord(doc: DeepLinkDocument): DeepLinkRecord {
        return {
            id: String(doc._id),
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            targetPath: doc.targetPath,
            imageUrl: doc.imageUrl,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
