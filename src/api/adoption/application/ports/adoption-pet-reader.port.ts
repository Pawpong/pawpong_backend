export type AdoptionPetType = 'dog' | 'cat' | 'reptile';
export type AdoptionPetStatus = 'available' | 'reserved' | 'adopted';
export type AdoptionPetSort = 'latest' | 'popular';

export type AdoptionPetListQuery = {
    petType?: AdoptionPetType;
    breederId?: string;
    excludePetId?: string;
    /** 분양 상태 필터 — 분양가능/예약중/분양완료 탭 (Figma 678:49176/49772/52698) */
    status?: AdoptionPetStatus;
    sort: AdoptionPetSort;
    skip: number;
    limit: number;
};

export type AdoptionPetSnapshot = {
    id: string;
    breederId: string;
    breederName?: string;
    name: string;
    breed: string;
    petType?: AdoptionPetType;
    gender: 'male' | 'female';
    birthDate: Date;
    price: number;
    status: AdoptionPetStatus;
    photos: string[];
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * v2 입양 상세 화면 (Figma 39:1240) 응답 조립용 확장 스냅샷.
 * 일반 카드 스냅샷에 건강/부모/사육환경/태그/소개 등 상세 필드를 추가한다.
 */
export type AdoptionPetDetailSnapshot = AdoptionPetSnapshot & {
    description?: string;
    tags?: string[];
    representativePhotoIndex?: number;
    vaccinationStatus?: 'completed' | 'incomplete';
    vaccinationRecords?: Array<{ name: string; date: Date; round: number }>;
    vaccinationIncompleteReason?: string;
    geneticTestStatus?: 'completed' | 'incomplete';
    geneticTestRecords?: Array<{ date: Date; institution: string; testName: string; result: string }>;
    geneticTestIncompleteReason?: string;
    parentPetSnapshots?: Array<{
        relation: 'mother' | 'father';
        breed: string;
        name: string;
        birthDate?: Date;
        photoFileName?: string;
    }>;
    breedingEnvironment?: {
        description?: string;
        photoFileName?: string;
    };
};

export const ADOPTION_PET_READER_PORT = Symbol('ADOPTION_PET_READER_PORT');

export interface AdoptionPetReaderPort {
    countList(query: Pick<AdoptionPetListQuery, 'petType' | 'breederId' | 'excludePetId' | 'status'>): Promise<number>;
    readList(query: AdoptionPetListQuery): Promise<AdoptionPetSnapshot[]>;
    readPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AdoptionPetSnapshot[]>;
    readById(petId: string): Promise<AdoptionPetSnapshot | null>;
    /**
     * 입양 상세용 — base snapshot 에 건강/부모/사육환경 등 추가 필드 포함.
     * isActive=false 항목은 null 을 반환한다.
     */
    readByIdDetailed(petId: string): Promise<AdoptionPetDetailSnapshot | null>;
    incrementFavoriteCount(petId: string, delta: number): Promise<void>;
}
