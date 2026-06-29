import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../schema/adoption-application.schema';
import type { AvailablePetDocument } from '../../../schema/available-pet.schema';
import { ChatRoom, ChatRoomDocument, ChatRoomStatus } from '../../../schema/chat-room.schema';
import type {
    BreederPetPostingCardSnapshot,
    BreederPetPostingReaderPort,
    ListMyPostingsQuery,
    ListMyPostingsResult,
} from '../application/ports/breeder-pet-posting-reader.port';
import { BreederPetPostingRepository } from '../repository/breeder-pet-posting.repository';

@Injectable()
export class BreederPetPostingReaderMongooseAdapter implements BreederPetPostingReaderPort {
    constructor(
        private readonly repository: BreederPetPostingRepository,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(ChatRoom.name)
        private readonly chatRoomModel: Model<ChatRoomDocument>,
    ) {}

    async listMyPostings(query: ListMyPostingsQuery): Promise<ListMyPostingsResult> {
        const { docs, totalItems } = await this.repository.listMyPostings({
            breederId: query.breederId,
            status: query.status,
            skip: query.skip,
            limit: query.limit,
        });
        const chatCountMap = await this.countActiveChatsByPetIds(docs.map((doc) => doc._id.toString()));
        return {
            snapshots: docs.map((doc) => this.toSnapshot(doc, chatCountMap.get(doc._id.toString()) ?? 0)),
            totalItems,
        };
    }

    private toSnapshot(doc: AvailablePetDocument, chatCount: number): BreederPetPostingCardSnapshot {
        return {
            petId: String(doc._id),
            name: doc.name,
            breed: doc.breed,
            petType: doc.petType ?? 'dog',
            gender: doc.gender as 'male' | 'female',
            birthDate: doc.birthDate,
            price: doc.price,
            status: doc.status as 'available' | 'reserved' | 'adopted',
            photos: doc.photos ?? [],
            representativePhotoIndex: doc.representativePhotoIndex ?? 0,
            description: doc.description ?? '',
            inquiryCount: doc.inquiryCount ?? 0,
            favoriteCount: doc.favoriteCount ?? 0,
            viewCount: doc.viewCount ?? 0,
            chatCount,
            createdAt: doc.createdAt,
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
