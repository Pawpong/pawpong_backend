export const BREEDER_PET_POSTING_READER_PORT = Symbol('BREEDER_PET_POSTING_READER_PORT');

export type BreederPetPostingStatus = 'available' | 'reserved' | 'adopted';

export interface BreederPetPostingCardSnapshot {
    petId: string;
    name: string;
    breed: string;
    petType: 'dog' | 'cat' | 'reptile';
    gender: 'male' | 'female';
    birthDate: Date;
    price: number;
    status: BreederPetPostingStatus;
    photos: string[];
    representativePhotoIndex: number;
    description: string;
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    chatCount: number;
    createdAt: Date;
}

export interface ListMyPostingsQuery {
    breederId: string;
    status?: BreederPetPostingStatus;
    skip: number;
    limit: number;
}

export interface ListMyPostingsResult {
    snapshots: BreederPetPostingCardSnapshot[];
    totalItems: number;
}

/**
 * 수정 화면 복원용 단건 스냅샷.
 *
 * 카드 스냅샷과 달리 작성 폼을 그대로 되돌리는 것이 목적이라
 * 표시용 가공 없이 저장된 원시값(파일키 / Date / enum)을 그대로 싣는다.
 */
export interface BreederPetPostingEditParentSnapshot {
    relation: 'mother' | 'father';
    breed: string;
    name: string;
    birthDate?: Date;
    photoFileName?: string;
}

export interface BreederPetPostingEditBreedingEnvironment {
    description?: string;
    /** [deprecated] 단일 사진 — photoFileNames 도입 전 데이터 호환용 */
    photoFileName?: string;
    photoFileNames?: string[];
}

export interface BreederPetPostingEditSnapshot {
    petId: string;
    name: string;
    breed: string;
    /** 레거시 문서는 비어 있을 수 있다 (마이그레이션 대상) */
    petType?: 'dog' | 'cat' | 'reptile';
    gender: 'male' | 'female';
    birthDate: Date;
    price: number;
    description: string;
    photos: string[];
    representativePhotoIndex: number;
    status: BreederPetPostingStatus;

    /** v2 이전에 작성된 글은 건강 정보가 없을 수 있다 */
    vaccinationStatus?: 'completed' | 'incomplete';
    vaccinationRecords: Array<{ name: string; date: Date; round: number }>;
    vaccinationIncompleteReason?: string;

    geneticTestStatus?: 'completed' | 'incomplete';
    geneticTestRecords: Array<{ date: Date; institution: string; testName: string; result: string }>;
    geneticTestIncompleteReason?: string;

    parentPetSnapshots: BreederPetPostingEditParentSnapshot[];
    breedingEnvironment?: BreederPetPostingEditBreedingEnvironment;

    updatedAt: Date;
}

export interface BreederPetPostingReaderPort {
    listMyPostings(query: ListMyPostingsQuery): Promise<ListMyPostingsResult>;

    /**
     * 작성자(breederId) 본인 + isActive=true 인 분양글 단건.
     * 남의 글 / 비활성 / 미존재는 모두 null — 호출측이 소유 여부를 구분하지 않고 동일하게 처리한다.
     */
    findEditSnapshotByOwner(petId: string, breederId: string): Promise<BreederPetPostingEditSnapshot | null>;
}
