import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { InquiryRepository } from '../repository/inquiry.repository';
import {
    InquiryBreederInfoSnapshot,
    InquiryCommandPort,
    InquiryCommandSnapshot,
} from '../application/ports/inquiry-command.port';

@Injectable()
export class InquiryRepositoryCommandAdapter implements InquiryCommandPort {
    constructor(private readonly inquiryRepository: InquiryRepository) {}

    async findInquiryById(inquiryId: string): Promise<InquiryCommandSnapshot | null> {
        const inquiry = await this.inquiryRepository.findDocumentById(inquiryId);
        if (!inquiry) {
            return null;
        }

        return {
            id: inquiry._id.toString(),
            authorId: inquiry.authorId.toString(),
            type: inquiry.type,
            animalType: inquiry.animalType,
            targetBreederId: inquiry.targetBreederId?.toString(),
            status: inquiry.status,
            answerCount: inquiry.answers?.length || 0,
        };
    }

    async create(data: {
        authorId: string;
        authorNickname: string;
        title: string;
        content: string;
        type: 'common' | 'direct';
        animalType: 'dog' | 'cat';
        targetBreederId?: string;
        imageUrls: string[];
    }): Promise<{ inquiryId: string }> {
        const inquiry = await this.inquiryRepository.create({
            authorId: new Types.ObjectId(data.authorId),
            authorNickname: data.authorNickname,
            title: data.title,
            content: data.content,
            type: data.type,
            animalType: data.animalType,
            targetBreederId: data.targetBreederId ? new Types.ObjectId(data.targetBreederId) : undefined,
            imageUrls: data.imageUrls,
            viewCount: 0,
            answers: [],
            status: 'active',
        });

        return { inquiryId: inquiry._id.toString() };
    }

    update(inquiryId: string, updateData: { title?: string; content?: string; imageUrls?: string[] }): Promise<void> {
        return this.inquiryRepository.update(inquiryId, updateData);
    }

    delete(inquiryId: string): Promise<void> {
        return this.inquiryRepository.delete(inquiryId);
    }

    async findAdopterNickname(userId: string): Promise<string | null> {
        const adopter = await this.inquiryRepository.findAdopterNickname(userId);
        return adopter?.nickname || null;
    }

    async existsBreeder(breederId: string): Promise<boolean> {
        const breeder = await this.inquiryRepository.findBreederById(breederId);
        return !!breeder;
    }

    async findBreederInfo(breederId: string): Promise<InquiryBreederInfoSnapshot | null> {
        const breeder = await this.inquiryRepository.findBreederInfo(breederId);
        if (!breeder) {
            return null;
        }

        return {
            name: breeder.name,
            profileImageFileName: breeder.profileImageFileName,
            petType: breeder.petType,
            breeds: breeder.breeds,
        };
    }

    appendAnswer(
        inquiryId: string,
        answerData: {
            breederId: string;
            breederName: string;
            profileImageUrl?: string;
            content: string;
            imageUrls: string[];
            helpfulCount: number;
            animalTypeName?: string;
            breed?: string;
        },
        answeredAt: Date,
    ): Promise<void> {
        return this.inquiryRepository.pushAnswer(
            inquiryId,
            {
                _id: new Types.ObjectId(),
                breederId: new Types.ObjectId(answerData.breederId),
                breederName: answerData.breederName,
                profileImageUrl: answerData.profileImageUrl,
                content: answerData.content,
                answeredAt,
                imageUrls: answerData.imageUrls,
                helpfulCount: answerData.helpfulCount,
                animalTypeName: answerData.animalTypeName,
                breed: answerData.breed,
            },
            answeredAt,
        );
    }
}
