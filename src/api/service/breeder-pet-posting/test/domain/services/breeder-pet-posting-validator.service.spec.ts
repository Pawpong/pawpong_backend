import { BadRequestException } from '@nestjs/common';

import { BreederPetPostingValidatorService } from '../../../domain/services/breeder-pet-posting-validator.service';
import type {
    BreederPetPostingCreateCommand,
    BreederPetPostingUpdateCommand,
} from '../../../application/types/breeder-pet-posting-command.type';

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

    describe('validateUpdate — 온 필드만 검사한다', () => {
        const update = (command: BreederPetPostingUpdateCommand) => () => validator.validateUpdate(command);

        it('빈 patch 는 통과한다', () => {
            expect(update({})).not.toThrow();
        });

        it('건강/부모/사육환경을 안 보내면 검사 대상이 아니다 — 기존 DB 값이 유지된다', () => {
            expect(update({ price: 100, name: '새 이름' })).not.toThrow();
        });

        describe('photos', () => {
            it('photos 제공 시 개수와 대표 인덱스를 검사한다', () => {
                expect(update({ photos: [] })).toThrow('이미지를 최소 1장 이상 업로드해주세요.');
                expect(update({ photos: ['p/1.jpg'], representativePhotoIndex: 5 })).toThrow(
                    '대표 사진 인덱스가 업로드된 이미지 범위를 벗어났습니다.',
                );
            });

            it('photos 없이 대표 인덱스만 바꾸면 음수만 막는다 — 기존 photos 길이는 알 수 없다', () => {
                expect(update({ representativePhotoIndex: 3 })).not.toThrow();
                expect(update({ representativePhotoIndex: -1 })).toThrow('대표 사진 인덱스가 유효하지 않습니다.');
            });
        });

        describe('건강 정보 그룹', () => {
            it('접종 그룹 일부만 보내면 status 를 요구한다', () => {
                expect(update({ vaccinationRecords: [] })).toThrow(
                    '접종 정보를 수정하려면 접종 상태를 함께 보내주세요.',
                );
                expect(update({ vaccinationIncompleteReason: '사유' })).toThrow(
                    '접종 정보를 수정하려면 접종 상태를 함께 보내주세요.',
                );
            });

            it('검사 그룹 일부만 보내면 status 를 요구한다', () => {
                expect(
                    update({
                        geneticTestRecords: [{ date: '2025-02-15', institution: 'A', testName: 'B', result: '정상' }],
                    }),
                ).toThrow('유전병 검사 정보를 수정하려면 검사 상태를 함께 보내주세요.');
            });

            it('그룹을 통째로 보내면 작성과 같은 규칙을 적용한다', () => {
                expect(update({ vaccinationStatus: 'completed', vaccinationRecords: [] })).toThrow(
                    '접종 완료 시 접종 기록을 1개 이상 입력해주세요.',
                );
                expect(update({ vaccinationStatus: 'incomplete' })).toThrow('접종 미완료 사유를 입력해주세요.');
                expect(
                    update({
                        vaccinationStatus: 'completed',
                        vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
                    }),
                ).not.toThrow();
            });
        });

        describe('부모 정보', () => {
            it('제공 시 엄마/아빠 중복을 막는다', () => {
                expect(
                    update({
                        parentPetSnapshots: [
                            { relation: 'father', breed: 'A', name: 'dad1' },
                            { relation: 'father', breed: 'B', name: 'dad2' },
                        ],
                    }),
                ).toThrow('아빠 정보는 1개까지만 등록할 수 있습니다.');
            });

            it('빈 배열(전체 삭제)은 통과한다', () => {
                expect(update({ parentPetSnapshots: [] })).not.toThrow();
            });
        });
    });
});
