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
        photoFileName?: string;
    };
}

export interface BreederPetPostingCreateResult {
    petId: string;
}
