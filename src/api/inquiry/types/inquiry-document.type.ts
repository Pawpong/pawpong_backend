import { Types } from 'mongoose';

export type InquiryObjectIdLike = {
    toString(): string;
};

export type InquiryAnswerDocumentRecord = {
    _id: InquiryObjectIdLike;
    breederId: InquiryObjectIdLike;
    breederName: string;
    profileImageUrl?: string;
    content: string;
    answeredAt: Date;
    imageUrls?: string[];
    helpfulCount?: number;
    animalTypeName?: string;
    breed?: string;
};

export type InquiryDocumentRecord = {
    _id: InquiryObjectIdLike;
    authorId: InquiryObjectIdLike;
    authorNickname: string;
    title: string;
    content: string;
    type: 'common' | 'direct';
    animalType: 'dog' | 'cat';
    targetBreederId?: InquiryObjectIdLike;
    imageUrls?: string[];
    viewCount?: number;
    answers?: InquiryAnswerDocumentRecord[];
    status?: 'active' | 'closed';
    latestAnsweredAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
};

export type InquiryCreateRecord = {
    authorId: Types.ObjectId;
    authorNickname: string;
    title: string;
    content: string;
    type: 'common' | 'direct';
    animalType: 'dog' | 'cat';
    targetBreederId?: Types.ObjectId;
    imageUrls: string[];
    viewCount: number;
    answers: InquiryAnswerDocumentRecord[];
    status: string;
};

export type InquiryAdopterNicknameRecord = {
    nickname: string;
};

export type InquiryBreederIdRecord = {
    _id: InquiryObjectIdLike;
};

export type InquiryBreederInfoRecord = {
    name: string;
    profileImageFileName?: string;
    petType?: string;
    breeds?: string[];
};

export type InquirySortRecord = Record<string, 1 | -1>;
