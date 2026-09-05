import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import type { AvailablePetDocument } from '../../../../schema/available-pet.schema';
import { ChatRoom, ChatRoomDocument, ChatRoomStatus } from '../../../../schema/chat-room.schema';
import {
    AdoptionPetDetailSnapshot,
    AdoptionPetListQuery,
    AdoptionPetReaderPort,
    AdoptionPetSnapshot,
    AdoptionPetType,
} from '../application/ports/adoption-pet-reader.port';
import { AdoptionPetRepository } from '../repository/adoption-pet.repository';

@Injectable()
export class AdoptionPetMongooseReaderAdapter implements AdoptionPetReaderPort {
    constructor(
        private readonly repository: AdoptionPetRepository,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(ChatRoom.name)
        private readonly chatRoomModel: Model<ChatRoomDocument>,
    ) {}

    countList(
        query: Pick<AdoptionPetListQuery, 'petType' | 'breederId' | 'excludePetId' | 'status' | 'keyword'>,
    ): Promise<number> {
        return this.repository.countList(query);
    }

    async readList(query: AdoptionPetListQuery): Promise<AdoptionPetSnapshot[]> {
        const items = await this.repository.findList(query);
        return this.toSnapshotsWithChatCounts(items as unknown as AvailablePetDocument[]);
    }

    async readPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AdoptionPetSnapshot[]> {
        const items = await this.repository.findPopular(petType, limit);
        return this.toSnapshotsWithChatCounts(items as unknown as AvailablePetDocument[]);
    }

    async readById(petId: string): Promise<AdoptionPetSnapshot | null> {
        const item = await this.repository.findById(petId);
        if (!item) return null;
        const snapshots = await this.toSnapshotsWithChatCounts([item as unknown as AvailablePetDocument]);
        return snapshots[0] ?? null;
    }

    async readActiveById(petId: string): Promise<AdoptionPetSnapshot | null> {
        const item = await this.repository.findActiveById(petId);
        if (!item) return null;
        const snapshots = await this.toSnapshotsWithChatCounts([item as unknown as AvailablePetDocument]);
        return snapshots[0] ?? null;
    }

    async readByIdDetailed(petId: string): Promise<AdoptionPetDetailSnapshot | null> {
        const item = await this.repository.findActiveById(petId);
        if (!item) return null;
        const detail = item as unknown as AvailablePetDocument;
        const chatCountMap = await this.countActiveChatsByPetIds([detail._id.toString()]);
        return this.toDetailSnapshot(detail, chatCountMap.get(detail._id.toString()) ?? 0);
    }

    incrementFavoriteCount(petId: string, delta: number): Promise<void> {
        return this.repository.incrementFavoriteCount(petId, delta);
    }

    private async toSnapshotsWithChatCounts(pets: AvailablePetDocument[]): Promise<AdoptionPetSnapshot[]> {
        const chatCountMap = await this.countActiveChatsByPetIds(pets.map((pet) => pet._id.toString()));
        return pets.map((pet) => this.toSnapshot(pet, chatCountMap.get(pet._id.toString()) ?? 0));
    }

    private toSnapshot(pet: AvailablePetDocument, chatCount: number): AdoptionPetSnapshot {
        return {
            id: pet._id.toString(),
            breederId: pet.breederId.toString(),
            name: pet.name,
            breed: pet.breed,
            petType: pet.petType,
            gender: pet.gender as 'male' | 'female',
            birthDate: pet.birthDate,
            price: pet.price,
            status: pet.status as 'available' | 'reserved' | 'adopted',
            photos: pet.photos ?? [],
            inquiryCount: pet.inquiryCount ?? 0,
            favoriteCount: pet.favoriteCount ?? 0,
            viewCount: pet.viewCount ?? 0,
            chatCount,
            createdAt: pet.createdAt,
            updatedAt: pet.updatedAt,
        };
    }

    private toDetailSnapshot(pet: AvailablePetDocument, chatCount: number): AdoptionPetDetailSnapshot {
        return {
            ...this.toSnapshot(pet, chatCount),
            description: pet.description,
            // tags 는 별도 필드가 아직 schema 에 없음 — 미래 확장 대비 빈 배열 기본
            tags: [],
            representativePhotoIndex: pet.representativePhotoIndex,
            vaccinationStatus: pet.vaccinationStatus,
            vaccinationRecords: pet.vaccinationRecords ?? [],
            vaccinationIncompleteReason: pet.vaccinationIncompleteReason,
            geneticTestStatus: pet.geneticTestStatus,
            geneticTestRecords: pet.geneticTestRecords ?? [],
            geneticTestIncompleteReason: pet.geneticTestIncompleteReason,
            parentPetSnapshots: pet.parentPetSnapshots ?? [],
            breedingEnvironment: pet.breedingEnvironment,
        };
    }

    private async countActiveChatsByPetIds(petIds: string[]): Promise<Map<string, number>> {
        const validPetIds = petIds.filter((petId) => Types.ObjectId.isValid(petId));
        if (validPetIds.length === 0) {
            return new Map();
        }

        const applications = await this.adoptionApplicationModel
            .find({ petId: { $in: validPetIds.map((petId) => new Types.ObjectId(petId)) } })
            .select({ _id: 1, petId: 1 })
            .lean<Array<{ _id: Types.ObjectId; petId?: Types.ObjectId }>>()
            .exec();
        if (applications.length === 0) {
            return new Map();
        }

        const applicationToPetId = new Map(
            applications
                .filter((application) => application.petId)
                .map((application) => [application._id.toString(), application.petId!.toString()]),
        );
        const counts = await this.chatRoomModel
            .aggregate<{ _id: string; count: number }>([
                {
                    $match: {
                        status: ChatRoomStatus.ACTIVE,
                        applicationId: { $in: [...applicationToPetId.keys()] },
                    },
                },
                { $group: { _id: '$applicationId', count: { $sum: 1 } } },
            ])
            .exec();

        const petChatCounts = new Map<string, number>();
        for (const count of counts) {
            const petId = applicationToPetId.get(count._id);
            if (petId) {
                petChatCounts.set(petId, (petChatCounts.get(petId) ?? 0) + count.count);
            }
        }
        return petChatCounts;
    }
}
