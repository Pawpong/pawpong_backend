import { BadRequestException } from '@nestjs/common';

import { BreederPetPostingValidatorService } from '../../../domain/services/breeder-pet-posting-validator.service';
import type { BreederPetPostingCreateCommand } from '../../../application/types/breeder-pet-posting-command.type';

const baseCommand = (): BreederPetPostingCreateCommand => ({
    name: '레오파드게코',
    breed: '레오파드게코',
    gender: 'female',
    birthDate: '2024-11-05',
    price: 200000,
    description: '귀여운 파이리',
    photos: ['available-pets/x/1.jpg'],
    representativePhotoIndex: 0,
    vaccinationStatus: 'completed',
    vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
    geneticTestStatus: 'incomplete',
    geneticTestIncompleteReason: '검사 예정',
});

describe('BreederPetPostingValidatorService', () => {
    const validator = new BreederPetPostingValidatorService();

    describe('photos', () => {
        it('photos 가 비어있으면 BadRequest', () => {
            expect(() => validator.validate({ ...baseCommand(), photos: [] })).toThrow(BadRequestException);
        });

        it('photos 11장이면 BadRequest', () => {
            const photos = Array.from({ length: 11 }, (_, i) => `p/${i}.jpg`);
            expect(() => validator.validate({ ...baseCommand(), photos })).toThrow(BadRequestException);
        });

        it('representativePhotoIndex 가 범위를 벗어나면 BadRequest', () => {
            expect(() =>
                validator.validate({ ...baseCommand(), photos: ['p/1.jpg'], representativePhotoIndex: 5 }),
            ).toThrow(BadRequestException);
        });
    });

    describe('vaccination', () => {
        it('completed 인데 records 가 비어있으면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    vaccinationStatus: 'completed',
                    vaccinationRecords: [],
                }),
            ).toThrow(BadRequestException);
        });

        it('completed 인데 incompleteReason 도 같이 넣으면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    vaccinationStatus: 'completed',
                    vaccinationRecords: [{ name: 'A', date: '2025-01-01', round: 1 }],
                    vaccinationIncompleteReason: '왜 같이 넣냐',
                }),
            ).toThrow(BadRequestException);
        });

        it('incomplete 인데 사유가 비어있으면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    vaccinationStatus: 'incomplete',
                    vaccinationRecords: [],
                    vaccinationIncompleteReason: '   ',
                }),
            ).toThrow(BadRequestException);
        });

        it('incomplete 인데 records 가 채워져 있으면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    vaccinationStatus: 'incomplete',
                    vaccinationIncompleteReason: '예정',
                    vaccinationRecords: [{ name: 'A', date: '2025-01-01', round: 1 }],
                }),
            ).toThrow(BadRequestException);
        });
    });

    describe('geneticTest', () => {
        it('completed 인데 records 가 비어있으면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    geneticTestStatus: 'completed',
                    geneticTestRecords: [],
                    geneticTestIncompleteReason: undefined,
                }),
            ).toThrow(BadRequestException);
        });

        it('incomplete 인데 사유 누락이면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    geneticTestStatus: 'incomplete',
                    geneticTestIncompleteReason: undefined,
                }),
            ).toThrow(BadRequestException);
        });
    });

    describe('parentPetSnapshots', () => {
        it('mother 2개 이상이면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    parentPetSnapshots: [
                        { relation: 'mother', breed: 'A', name: 'mom1' },
                        { relation: 'mother', breed: 'A', name: 'mom2' },
                    ],
                }),
            ).toThrow(BadRequestException);
        });

        it('father 2개 이상이면 BadRequest', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    parentPetSnapshots: [
                        { relation: 'father', breed: 'A', name: 'dad1' },
                        { relation: 'father', breed: 'A', name: 'dad2' },
                    ],
                }),
            ).toThrow(BadRequestException);
        });

        it('mother + father 각 1개씩은 통과', () => {
            expect(() =>
                validator.validate({
                    ...baseCommand(),
                    parentPetSnapshots: [
                        { relation: 'mother', breed: 'A', name: 'mom' },
                        { relation: 'father', breed: 'A', name: 'dad' },
                    ],
                }),
            ).not.toThrow();
        });
    });

    it('정상 입력은 throw 하지 않는다', () => {
        expect(() => validator.validate(baseCommand())).not.toThrow();
    });
});
