export type InquiryAnimalType = 'dog' | 'cat';
export type InquiryType = 'common' | 'direct';

export interface InquiryAnswerSnapshot {
    id: string;
    breederId: string;
    breederName: string;
    answeredAt: Date;
    content: string;
    profileImageUrl?: string;
    imageUrls: string[];
    helpfulCount: number;
    animalTypeName?: string;
    breed?: string;
}

export interface InquiryListSnapshot {
    id: string;
    authorId: string;
    authorNickname: string;
    title: string;
    content: string;
    type: InquiryType;
    animalType: InquiryAnimalType;
    targetBreederId?: string;
    imageUrls: string[];
    viewCount: number;
    answers: InquiryAnswerSnapshot[];
    createdAt: Date;
}

export interface PublicInquiryListQuery {
    animalType?: InquiryAnimalType;
    sort: string;
    skip: number;
    limit: number;
}

export interface MyInquiryListQuery {
    authorId: string;
    animalType?: InquiryAnimalType;
    skip: number;
    limit: number;
}

export interface BreederInquiryListQuery {
    breederId: string;
    answered: boolean;
    skip: number;
    limit: number;
}

export const INQUIRY_READER_PORT = Symbol('INQUIRY_READER_PORT');

export interface InquiryReaderPort {
    readPublicList(query: PublicInquiryListQuery): Promise<InquiryListSnapshot[]>;
    readMyList(query: MyInquiryListQuery): Promise<InquiryListSnapshot[]>;
    readBreederList(query: BreederInquiryListQuery): Promise<InquiryListSnapshot[]>;
    readDetail(inquiryId: string): Promise<InquiryListSnapshot | null>;
    incrementViewCount(inquiryId: string): void;
}
