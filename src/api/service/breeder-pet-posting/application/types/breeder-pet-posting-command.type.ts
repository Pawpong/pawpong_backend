/**
 * v2 분양글 작성 — application 계층 command 타입
 * HTTP request DTO 와 다르며 use-case <-> port 사이 내부 모델로만 사용한다.
 */

export type VaccinationStatus = 'completed' | 'incomplete';
export type GeneticTestStatus = 'completed' | 'incomplete';
export type ParentRelation = 'mother' | 'father';
export type PostingPetType = 'dog' | 'cat' | 'reptile';
export type PostingGender = 'male' | 'female';

export interface BreederPetPostingVaccinationRecordCommand {
    name: string;
    date: string;
    round: number;
}

export interface BreederPetPostingGeneticTestRecordCommand {
    date: string;
    institution: string;
    testName: string;
    result: string;
}

export interface BreederPetPostingParentSnapshotCommand {
    relation: ParentRelation;
    breed: string;
    name: string;
    birthDate?: string;
    photoFileName?: string;
}

export interface BreederPetPostingBreedingEnvironmentCommand {
    description?: string;
    /** 사육 환경 사진 배열 (최대 5장) — photoFileName 보다 우선 */
    photoFileNames?: string[];
    /** [deprecated] 단일 사진 — photoFileNames 도입 전 클라이언트 하위 호환용 */
    photoFileName?: string;
}

export interface BreederPetPostingCreateCommand {
    name: string;
    breed: string;
    gender: PostingGender;
    birthDate: string;
    price: number;
    description: string;
    photos: string[];
    representativePhotoIndex?: number;
    petType?: PostingPetType;

    vaccinationStatus: VaccinationStatus;
    vaccinationRecords?: BreederPetPostingVaccinationRecordCommand[];
    vaccinationIncompleteReason?: string;

    geneticTestStatus: GeneticTestStatus;
    geneticTestRecords?: BreederPetPostingGeneticTestRecordCommand[];
    geneticTestIncompleteReason?: string;

    parentPetSnapshots?: BreederPetPostingParentSnapshotCommand[];
    breedingEnvironment?: BreederPetPostingBreedingEnvironmentCommand;
    /** 임시저장에서 이어서 등록한 경우 — 등록 성공 시 해당 draft 를 삭제한다 */
    draftId?: string;
}

export interface BreederPetPostingVaccinationRecordPersistData {
    name: string;
    date: Date;
    round: number;
}

export interface BreederPetPostingGeneticTestRecordPersistData {
    date: Date;
    institution: string;
    testName: string;
    result: string;
}

export interface BreederPetPostingParentSnapshotPersistData {
    relation: ParentRelation;
    breed: string;
    name: string;
    birthDate?: Date;
    photoFileName?: string;
}

export interface BreederPetPostingCreatePersistData {
    breederId: string;
    name: string;
    breed: string;
    gender: PostingGender;
    birthDate: Date;
    price: number;
    description: string;
    photos: string[];
    representativePhotoIndex: number;
    petType?: PostingPetType;
    status: 'available';
    isActive: true;

    vaccinationStatus: VaccinationStatus;
    vaccinationRecords: BreederPetPostingVaccinationRecordPersistData[];
    vaccinationIncompleteReason?: string;

    geneticTestStatus: GeneticTestStatus;
    geneticTestRecords: BreederPetPostingGeneticTestRecordPersistData[];
    geneticTestIncompleteReason?: string;

    parentPetSnapshots: BreederPetPostingParentSnapshotPersistData[];
    breedingEnvironment?: {
        description?: string;
        /** 하위 호환 — photoFileNames 의 첫 장을 함께 저장 */
        photoFileName?: string;
        photoFileNames?: string[];
    };
}

export interface BreederPetPostingCreateResult {
    petId: string;
}

/**
 * v2 분양글 부분 수정 command.
 *
 * 본 슬라이스는 단순 / 안전 필드만 지원한다:
 * - 기본 정보 (name, breed, gender, birthDate, price, description, petType)
 * - 분양 상태 전환 (status: available / reserved / adopted)
 * - 사진 (photos / representativePhotoIndex)
 *
 * 복잡 필드(vaccination/geneticTest/parents/breedingEnvironment) 는 cross-field validation
 * 부담이 커서 별도 PR 로 분리한다. 본 PR 의 update 는 위 화이트리스트 외의 필드를 받지 않는다.
 */
export interface BreederPetPostingUpdateCommand {
    name?: string;
    breed?: string;
    gender?: PostingGender;
    birthDate?: string;
    price?: number;
    description?: string;
    petType?: PostingPetType;
    status?: 'available' | 'reserved' | 'adopted';
    photos?: string[];
    representativePhotoIndex?: number;
}

/**
 * persist 단계 — Date 캐스팅 등 적용 후 Mongoose $set 에 그대로 전달 가능한 모양.
 */
export interface BreederPetPostingUpdatePersistData {
    name?: string;
    breed?: string;
    gender?: PostingGender;
    birthDate?: Date;
    price?: number;
    description?: string;
    petType?: PostingPetType;
    status?: 'available' | 'reserved' | 'adopted';
    photos?: string[];
    representativePhotoIndex?: number;
}

export interface BreederPetPostingDeleteResult {
    petId: string;
    deleted: boolean;
}
