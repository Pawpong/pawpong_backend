import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { InquiryRepository } from '../inquiry.repository';
import {
    BreederInquiryListQuery,
    InquiryListSnapshot,
    InquiryReaderPort,
    MyInquiryListQuery,
    PublicInquiryListQuery,
} from '../application/ports/inquiry-reader.port';

@Injectable()
export class InquiryRepositoryReaderAdapter implements InquiryReaderPort {
    constructor(private readonly inquiryRepository: InquiryRepository) {}

    async readPublicList(query: PublicInquiryListQuery): Promise<InquiryListSnapshot[]> {
        const filter: Record<string, any> = { type: 'common', status: 'active' };
        if (query.animalType) {
            filter.animalType = query.animalType;
        }

        const items = await this.inquiryRepository.findPublicList(
            filter,
            this.buildSortOption(query.sort),
            query.skip,
            query.limit,
        );

        return items.map((inquiry) => this.toSnapshot(inquiry));
    }

    async readMyList(query: MyInquiryListQuery): Promise<InquiryListSnapshot[]> {
        const filter: Record<string, any> = {
            authorId: new Types.ObjectId(query.authorId),
        };
        if (query.animalType) {
            filter.animalType = query.animalType;
        }

        const items = await this.inquiryRepository.findByAuthor(filter, query.skip, query.limit);
        return items.map((inquiry) => this.toSnapshot(inquiry));
    }

    async readBreederList(query: BreederInquiryListQuery): Promise<InquiryListSnapshot[]> {
        const items = await this.inquiryRepository.findByTargetBreeder(
            query.breederId,
            query.answered,
            query.skip,
            query.limit,
        );

        return items.map((inquiry) => this.toSnapshot(inquiry));
    }

    async readDetail(inquiryId: string): Promise<InquiryListSnapshot | null> {
        const inquiry = await this.inquiryRepository.findById(inquiryId);
        return inquiry ? this.toSnapshot(inquiry) : null;
    }

    incrementViewCount(inquiryId: string): void {
        this.inquiryRepository.incrementViewCount(inquiryId);
    }

    private buildSortOption(sort: string): Record<string, any> {
        switch (sort) {
            case 'latest_answer':
                return { latestAnsweredAt: -1, createdAt: -1 };
            case 'most_viewed':
                return { viewCount: -1, createdAt: -1 };
            case 'latest':
            default:
                return { createdAt: -1 };
        }
    }

    private toSnapshot(inquiry: any): InquiryListSnapshot {
        return {
            id: inquiry._id.toString(),
            authorId: inquiry.authorId.toString(),
            authorNickname: inquiry.authorNickname,
            title: inquiry.title,
            content: inquiry.content,
            type: inquiry.type,
            animalType: inquiry.animalType,
            targetBreederId: inquiry.targetBreederId?.toString(),
            imageUrls: inquiry.imageUrls || [],
            viewCount: inquiry.viewCount || 0,
            answers: (inquiry.answers || []).map((answer) => ({
                id: answer._id.toString(),
                breederId: answer.breederId.toString(),
                breederName: answer.breederName,
                answeredAt: answer.answeredAt,
                content: answer.content,
                profileImageUrl: answer.profileImageUrl,
                imageUrls: answer.imageUrls || [],
                helpfulCount: answer.helpfulCount ?? 0,
                animalTypeName: answer.animalTypeName,
                breed: answer.breed,
            })),
            createdAt: inquiry.createdAt,
        };
    }
}
