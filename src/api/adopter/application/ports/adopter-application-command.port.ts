export type AdopterApplicationCustomResponseRecord = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: any;
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
    standardResponses: Record<string, any>;
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
