import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import type { AvailablePetDocument } from '../../../../schema/available-pet.schema';
import { ChatRoom, ChatRoomDocument, ChatRoomStatus } from '../../../../schema/chat-room.schema';
import type { AdoptionPetSnapshot } from '../application/ports/adoption-pet-reader.port';
import type {
    AdoptionRecordReaderPort,
    ListMyAdoptedQuery,
    ListMyAdoptedResult,
} from '../application/ports/adoption-record-reader.port';
import { AdoptionRecordRepository } from '../repository/adoption-record.repository';

@Injectable()
export class AdoptionRecordMongooseReaderAdapter implements AdoptionRecordReaderPort {
    constructor(
        private readonly repository: AdoptionRecordRepository,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(ChatRoom.name)
        private readonly chatRoomModel: Model<ChatRoomDocument>,
    ) {}

    async listMyAdopted(query: ListMyAdoptedQuery): Promise<ListMyAdoptedResult> {
        const { docs, totalItems } = await this.repository.aggregateMyAdopted(query.adopterId, {
            skip: query.skip,
            limit: query.limit,
        });
        const chatCountMap = await this.countActiveChatsByPetIds(docs.map((doc) => String(doc.pet._id)));

        return {
            items: docs.map((doc) => ({
                pet: this.toPetSnapshot(doc.pet, chatCountMap.get(String(doc.pet._id)) ?? 0),
                adoptedAt: doc.adoptedAt instanceof Date ? doc.adoptedAt : new Date(doc.adoptedAt),
            })),
            totalItems,
        };
    }

    private toPetSnapshot(pet: AvailablePetDocument, chatCount: number): AdoptionPetSnapshot {
        return {
            id: String(pet._id),
            breederId: String(pet.breederId),
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

    private async countActiveChatsByPetIds(petIds: string[]): Promise<Map<string, number>> {
        const validPetIds = petIds.filter((petId) => Types.ObjectId.isValid(petId));
        if (validPetIds.length === 0) return new Map();

        const applications = await this.adoptionApplicationModel
            .find({ petId: { $in: validPetIds.map((petId) => new Types.ObjectId(petId)) } })
            .select({ _id: 1, petId: 1 })
            .lean<Array<{ _id: Types.ObjectId; petId?: Types.ObjectId }>>()
            .exec();
        const applicationToPetId = new Map(
            applications
                .filter((application) => application.petId)
                .map((application) => [application._id.toString(), application.petId!.toString()]),
        );
        if (applicationToPetId.size === 0) return new Map();

        const counts = await this.chatRoomModel
            .aggregate<{
                _id: string;
                count: number;
            }>([{ $match: { status: ChatRoomStatus.ACTIVE, applicationId: { $in: [...applicationToPetId.keys()] } } }, { $group: { _id: '$applicationId', count: { $sum: 1 } } }])
            .exec();

        const petChatCounts = new Map<string, number>();
        for (const count of counts) {
            const petId = applicationToPetId.get(count._id);
            if (petId) petChatCounts.set(petId, (petChatCounts.get(petId) ?? 0) + count.count);
        }
        return petChatCounts;
    }
}
