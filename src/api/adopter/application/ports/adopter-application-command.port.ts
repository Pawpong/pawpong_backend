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

export const ADOPTER_APPLICATION_COMMAND_PORT = Symbol('ADOPTER_APPLICATION_COMMAND_PORT');

export interface AdopterApplicationCommandPort {
    findPendingByAdopterAndBreeder(
        adopterId: string,
        breederId: string,
    ): Promise<AdopterApplicationCreatedRecord | null>;
    create(command: AdopterApplicationCreateCommand): Promise<AdopterApplicationCreatedRecord>;
}
