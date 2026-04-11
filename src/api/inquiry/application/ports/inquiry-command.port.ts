import { InquiryAnimalType, InquiryType } from './inquiry-reader.port';

export interface InquiryCommandSnapshot {
    id: string;
    authorId: string;
    type: InquiryType;
    animalType: InquiryAnimalType;
    targetBreederId?: string;
    status: 'active' | 'closed';
    answerCount: number;
}

export interface InquiryBreederInfoSnapshot {
    name: string;
    profileImageFileName?: string;
    petType?: string;
    breeds?: string[];
}

export const INQUIRY_COMMAND_PORT = Symbol('INQUIRY_COMMAND_PORT');

export interface InquiryCommandPort {
    findInquiryById(inquiryId: string): Promise<InquiryCommandSnapshot | null>;
    create(data: {
        authorId: string;
        authorNickname: string;
        title: string;
        content: string;
        type: InquiryType;
        animalType: InquiryAnimalType;
        targetBreederId?: string;
        imageUrls: string[];
    }): Promise<{ inquiryId: string }>;
    update(inquiryId: string, updateData: { title?: string; content?: string; imageUrls?: string[] }): Promise<void>;
    delete(inquiryId: string): Promise<void>;
    findAdopterNickname(userId: string): Promise<string | null>;
    existsBreeder(breederId: string): Promise<boolean>;
    findBreederInfo(breederId: string): Promise<InquiryBreederInfoSnapshot | null>;
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
    ): Promise<void>;
}
