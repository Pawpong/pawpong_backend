import type {
    AdopterApplicationAnswerValue,
    AdopterApplicationStandardResponsesRecord,
} from '../../types/adopter-application.type';

export type AdopterApplicationCustomResponseRecord = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterApplicationCreateCommand = {
    breederId: string;
    adopterId: string;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    petId?: string;
    petName?: string;
    status: string;
    standardResponses: AdopterApplicationStandardResponsesRecord;
    customResponses: AdopterApplicationCustomResponseRecord[];
    appliedAt: Date;
};

export type AdopterApplicationCreatedRecord = {
    _id: { toString(): string };
    breederId: { toString(): string };
    petId?: { toString(): string };
    status: string;
    appliedAt: Date;
};

export abstract class AdopterApplicationCommandPort {
    abstract findPendingByAdopterAndBreeder(
        adopterId: string,
        breederId: string,
    ): Promise<AdopterApplicationCreatedRecord | null>;
    abstract create(command: AdopterApplicationCreateCommand): Promise<AdopterApplicationCreatedRecord>;
}
