import { BadRequestException, Injectable } from '@nestjs/common';

import type {
    BreederPetPostingCreateCommand,
    BreederPetPostingCreatePersistData,
    BreederPetPostingGeneticTestRecordPersistData,
    BreederPetPostingParentSnapshotPersistData,
    BreederPetPostingVaccinationRecordPersistData,
} from '../../application/types/breeder-pet-posting-command.type';

/**
 * v2 분양글 작성 — application command -> persistence data 매퍼.
 *
 * 날짜 문자열을 Date 로 변환하고, status 별로 records 또는 incompleteReason 만 보존한다.
 */
@Injectable()
export class BreederPetPostingMapperService {
    toPersistData(breederId: string, command: BreederPetPostingCreateCommand): BreederPetPostingCreatePersistData {
        return {
            breederId,
            name: command.name,
            breed: command.breed,
            gender: command.gender,
            birthDate: this.toDate(command.birthDate, '태어난 날짜'),
            price: command.price,
            description: command.description,
            photos: command.photos,
            representativePhotoIndex: command.representativePhotoIndex ?? 0,
            petType: command.petType,
            status: 'available',
            isActive: true,

            vaccinationStatus: command.vaccinationStatus,
            vaccinationRecords:
                command.vaccinationStatus === 'completed'
                    ? this.toVaccinationRecords(command.vaccinationRecords ?? [])
                    : [],
            vaccinationIncompleteReason:
                command.vaccinationStatus === 'incomplete' ? command.vaccinationIncompleteReason?.trim() : undefined,

            geneticTestStatus: command.geneticTestStatus,
            geneticTestRecords:
                command.geneticTestStatus === 'completed'
                    ? this.toGeneticTestRecords(command.geneticTestRecords ?? [])
                    : [],
            geneticTestIncompleteReason:
                command.geneticTestStatus === 'incomplete' ? command.geneticTestIncompleteReason?.trim() : undefined,

            parentPetSnapshots: this.toParentSnapshots(command.parentPetSnapshots ?? []),
            breedingEnvironment: this.toBreedingEnvironment(command.breedingEnvironment),
        };
    }

    private toVaccinationRecords(
        records: BreederPetPostingCreateCommand['vaccinationRecords'] = [],
    ): BreederPetPostingVaccinationRecordPersistData[] {
        return records.map((record) => ({
            name: record.name,
            date: this.toDate(record.date, '접종일'),
            round: record.round,
        }));
    }

    private toGeneticTestRecords(
        records: BreederPetPostingCreateCommand['geneticTestRecords'] = [],
    ): BreederPetPostingGeneticTestRecordPersistData[] {
        return records.map((record) => ({
            date: this.toDate(record.date, '검사 검진일'),
            institution: record.institution,
            testName: record.testName,
            result: record.result,
        }));
    }

    private toParentSnapshots(
        snapshots: BreederPetPostingCreateCommand['parentPetSnapshots'] = [],
    ): BreederPetPostingParentSnapshotPersistData[] {
        return snapshots.map((snapshot) => ({
            relation: snapshot.relation,
            breed: snapshot.breed,
            name: snapshot.name,
            birthDate: snapshot.birthDate ? this.toDate(snapshot.birthDate, '부모 태어난 날짜') : undefined,
            photoFileName: snapshot.photoFileName,
        }));
    }

    private toBreedingEnvironment(
        environment: BreederPetPostingCreateCommand['breedingEnvironment'],
    ): BreederPetPostingCreatePersistData['breedingEnvironment'] {
        if (!environment) {
            return undefined;
        }
        const description = environment.description?.trim();
        const photoFileName = environment.photoFileName?.trim();
        if (!description && !photoFileName) {
            return undefined;
        }
        return {
            description: description || undefined,
            photoFileName: photoFileName || undefined,
        };
    }

    private toDate(value: string, fieldLabel: string): Date {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldLabel} 형식이 올바르지 않습니다.`);
        }
        return date;
    }
}
