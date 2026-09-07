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
    // petType 은 클라이언트 입력을 받지 않는다 — 글쓴 브리더의 breeders.petType 에서 파생한다.

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
    /** 글쓴 브리더의 축종에서 파생한 값. 탐색 페이지 축종 탭 필터의 근거라 반드시 채운다. */
    petType: PostingPetType;
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
 * 지원 범위:
 * - 기본 정보 (name, breed, gender, birthDate, price, description)
 * - 분양 상태 전환 (status: available / reserved / adopted)
 * - 사진 (photos / representativePhotoIndex)
 * - 건강 정보 (vaccination / geneticTest), 부모 정보, 사육 환경
 *
 * 미제공(undefined) 필드는 기존 DB 값을 그대로 유지한다.
 * 배열/객체 필드는 부분 병합이 아니라 전체 교체다.
 *
 * 건강 정보는 status 와 records/사유가 서로를 구속하므로 그룹 단위로만 수정할 수 있다.
 * (그룹 내 아무 필드나 오면 status 도 함께 와야 한다 — validator 가 강제)
 */
export interface BreederPetPostingUpdateCommand {
    name?: string;
    breed?: string;
    gender?: PostingGender;
    birthDate?: string;
    price?: number;
    description?: string;
    // petType 은 브리더 계정 축종에 종속되므로 수정 대상이 아니다 (use-case 가 브리더 값으로 재확정한다).
    status?: 'available' | 'reserved' | 'adopted';
    photos?: string[];
    representativePhotoIndex?: number;

    vaccinationStatus?: VaccinationStatus;
    vaccinationRecords?: BreederPetPostingVaccinationRecordCommand[];
    vaccinationIncompleteReason?: string;

    geneticTestStatus?: GeneticTestStatus;
    geneticTestRecords?: BreederPetPostingGeneticTestRecordCommand[];
    geneticTestIncompleteReason?: string;

    parentPetSnapshots?: BreederPetPostingParentSnapshotCommand[];
    breedingEnvironment?: BreederPetPostingBreedingEnvironmentCommand;
}

/**
 * persist 단계 — Date 캐스팅 등 적용 후 Mongoose 갱신 연산에 그대로 전달 가능한 모양.
 *
 * 값 규약 (repository.updateByOwner 가 해석한다):
 * - undefined : 손대지 않음 (기존 DB 값 유지)
 * - null      : 명시적 제거($unset). status 전환으로 모순이 된 값을 지울 때 쓴다.
 *               예) 접종 상태를 completed 로 바꾸면 남아 있던 미완료 사유를 지워야 한다.
 *               ($set: null 로 두면 필드가 null 인 채로 남아 조회 응답에 새어나간다)
 * - 그 외      : $set
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

    vaccinationStatus?: VaccinationStatus;
    vaccinationRecords?: BreederPetPostingVaccinationRecordPersistData[];
    vaccinationIncompleteReason?: string | null;

    geneticTestStatus?: GeneticTestStatus;
    geneticTestRecords?: BreederPetPostingGeneticTestRecordPersistData[];
    geneticTestIncompleteReason?: string | null;

    parentPetSnapshots?: BreederPetPostingParentSnapshotPersistData[];
    breedingEnvironment?: BreederPetPostingCreatePersistData['breedingEnvironment'] | null;
}

export interface BreederPetPostingDeleteResult {
    petId: string;
    deleted: boolean;
}
