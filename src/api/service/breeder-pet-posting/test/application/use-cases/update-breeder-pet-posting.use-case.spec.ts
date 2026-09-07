import { BadRequestException } from '@nestjs/common';

import type { BreederPetPostingUpdateCommand } from '../../../application/types/breeder-pet-posting-command.type';
import { UpdateBreederPetPostingUseCase } from '../../../application/use-cases/update-breeder-pet-posting.use-case';
import { BreederPetPostingMapperService } from '../../../domain/services/breeder-pet-posting-mapper.service';
import { BreederPetPostingValidatorService } from '../../../domain/services/breeder-pet-posting-validator.service';

describe('UpdateBreederPetPostingUseCase', () => {
    const profilePort = { findById: jest.fn() };
    const writerPort = { updateByOwner: jest.fn() };

    // 검증/매핑은 작성 경로와 같은 도메인 서비스를 쓰므로 실제 구현을 그대로 넣는다
    const useCase = new UpdateBreederPetPostingUseCase(
        profilePort as any,
        writerPort as any,
        new BreederPetPostingValidatorService(),
        new BreederPetPostingMapperService(),
    );

    /** 마지막 updateByOwner 호출에 실린 patch */
    const lastPatch = () => writerPort.updateByOwner.mock.calls.at(-1)![2];

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue({ breederId: 'breeder-1', petType: 'cat' });
        writerPort.updateByOwner.mockResolvedValue({ changed: true });
    });

    it('브리더가 존재하지 않으면 BadRequest', async () => {
        profilePort.findById.mockResolvedValueOnce(null);

        await expect(useCase.execute('user-1', 'pet-1', { price: 100 })).rejects.toThrow(BadRequestException);
        expect(writerPort.updateByOwner).not.toHaveBeenCalled();
    });

    it('본인 글이 아니면 BadRequest', async () => {
        writerPort.updateByOwner.mockResolvedValueOnce({ changed: false });

        await expect(useCase.execute('user-1', 'pet-1', { price: 100 })).rejects.toThrow(BadRequestException);
    });

    it('수정 시 petType 을 브리더 계정 축종으로 재확정한다', async () => {
        // 마이그레이션 전 petType 이 비어 있던 글도 브리더가 수정하면 스스로 복구된다
        await useCase.execute('user-1', 'pet-1', { price: 100 });

        expect(writerPort.updateByOwner).toHaveBeenCalledWith('pet-1', 'breeder-1', { price: 100, petType: 'cat' });
    });

    it('클라이언트가 보낸 petType 은 무시한다', async () => {
        await useCase.execute('user-1', 'pet-1', {
            price: 100,
            petType: 'dog',
        } as BreederPetPostingUpdateCommand);

        expect(lastPatch().petType).toBe('cat');
    });

    it('빈 patch 는 소유 확인만 하도록 petType 도 싣지 않는다', async () => {
        await useCase.execute('user-1', 'pet-1', {});

        expect(lastPatch()).toEqual({});
    });

    it('브리더 축종을 알 수 없으면 petType 을 건드리지 않는다', async () => {
        profilePort.findById.mockResolvedValueOnce({ breederId: 'breeder-1' });

        await useCase.execute('user-1', 'pet-1', { price: 100 });

        expect(lastPatch()).toEqual({ price: 100 });
    });

    describe('4개 필드군 — 미제공 시 기존 값 유지', () => {
        it('건강/부모/사육환경을 안 보내면 patch 에 키 자체가 없다', async () => {
            await useCase.execute('user-1', 'pet-1', { name: '새 이름' });

            const patch = lastPatch();
            expect(patch).toEqual({ name: '새 이름', petType: 'cat' });
            // 키 부재가 계약이다 — undefined 라도 키가 있으면 $set 후보로 취급될 여지가 생긴다
            expect('vaccinationStatus' in patch).toBe(false);
            expect('geneticTestStatus' in patch).toBe(false);
            expect('parentPetSnapshots' in patch).toBe(false);
            expect('breedingEnvironment' in patch).toBe(false);
        });
    });

    describe('클라이언트가 보낸 null', () => {
        // class-validator 의 @IsOptional 은 null 을 통과시킨다 — 배열/객체 필드에서 500 이 나면 안 된다
        it('null 은 미제공으로 취급해 기존 값을 유지한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                price: 100,
                parentPetSnapshots: null,
                breedingEnvironment: null,
                vaccinationStatus: null,
            } as unknown as BreederPetPostingUpdateCommand);

            const patch = lastPatch();
            expect(patch).toEqual({ price: 100, petType: 'cat' });
            expect('parentPetSnapshots' in patch).toBe(false);
            expect('breedingEnvironment' in patch).toBe(false);
            expect('vaccinationStatus' in patch).toBe(false);
        });
    });

    describe('예방접종', () => {
        it('completed 로 바꾸면 기록을 Date 로 저장하고 미완료 사유는 제거(null)한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                vaccinationStatus: 'completed',
                vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
            });

            const patch = lastPatch();
            expect(patch.vaccinationStatus).toBe('completed');
            expect(patch.vaccinationRecords).toEqual([{ name: '종합백신', date: new Date('2024-12-01'), round: 1 }]);
            // 상태를 뒤집었으니 남아 있던 미완료 사유는 모순 — null 로 제거를 지시한다
            expect(patch.vaccinationIncompleteReason).toBeNull();
        });

        it('incomplete 로 바꾸면 사유를 저장하고 기록을 비운다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                vaccinationStatus: 'incomplete',
                vaccinationIncompleteReason: '  태어난지 한달도 안됨  ',
            });

            const patch = lastPatch();
            expect(patch.vaccinationRecords).toEqual([]);
            expect(patch.vaccinationIncompleteReason).toBe('태어난지 한달도 안됨');
        });

        it('completed 인데 기록이 비면 거부한다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', { vaccinationStatus: 'completed', vaccinationRecords: [] }),
            ).rejects.toThrow('접종 완료 시 접종 기록을 1개 이상 입력해주세요.');
            expect(writerPort.updateByOwner).not.toHaveBeenCalled();
        });

        it('completed 인데 미완료 사유를 같이 보내면 거부한다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', {
                    vaccinationStatus: 'completed',
                    vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
                    vaccinationIncompleteReason: '아직 안함',
                }),
            ).rejects.toThrow('접종 완료 상태에서는 미완료 사유를 입력할 수 없습니다.');
        });

        it('incomplete 인데 사유가 비면 거부한다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', {
                    vaccinationStatus: 'incomplete',
                    vaccinationIncompleteReason: '   ',
                }),
            ).rejects.toThrow('접종 미완료 사유를 입력해주세요.');
        });

        it('상태 없이 기록만 보내면 거부한다 — DB 값과 모순될 수 있다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', {
                    vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
                }),
            ).rejects.toThrow('접종 정보를 수정하려면 접종 상태를 함께 보내주세요.');
        });
    });

    describe('유전병 검사', () => {
        it('completed 로 바꾸면 기록을 저장하고 미완료 사유를 제거한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                geneticTestStatus: 'completed',
                geneticTestRecords: [
                    { date: '2025-02-15', institution: '한국유전자검사센터', testName: '슬개골', result: '정상' },
                ],
            });

            const patch = lastPatch();
            expect(patch.geneticTestRecords).toEqual([
                {
                    date: new Date('2025-02-15'),
                    institution: '한국유전자검사센터',
                    testName: '슬개골',
                    result: '정상',
                },
            ]);
            expect(patch.geneticTestIncompleteReason).toBeNull();
        });

        it('incomplete 로 바꾸면 기록을 비운다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                geneticTestStatus: 'incomplete',
                geneticTestIncompleteReason: '태어난지 한달도 안됨',
            });

            expect(lastPatch().geneticTestRecords).toEqual([]);
        });

        it('completed 인데 기록이 없으면 거부한다', async () => {
            await expect(useCase.execute('user-1', 'pet-1', { geneticTestStatus: 'completed' })).rejects.toThrow(
                '유전병 검사 완료 시 검사 기록을 1개 이상 입력해주세요.',
            );
        });

        it('상태 없이 사유만 보내면 거부한다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', { geneticTestIncompleteReason: '아직 안함' }),
            ).rejects.toThrow('유전병 검사 정보를 수정하려면 검사 상태를 함께 보내주세요.');
        });
    });

    describe('부모 정보', () => {
        it('보낸 배열이 기존 배열을 통째로 대체한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                parentPetSnapshots: [
                    { relation: 'mother', breed: '레오파드게코', name: '마망', birthDate: '2020-04-10' },
                ],
            });

            expect(lastPatch().parentPetSnapshots).toEqual([
                {
                    relation: 'mother',
                    breed: '레오파드게코',
                    name: '마망',
                    birthDate: new Date('2020-04-10'),
                    photoFileName: undefined,
                },
            ]);
        });

        it('빈 배열을 보내면 부모 정보를 모두 지운다', async () => {
            await useCase.execute('user-1', 'pet-1', { parentPetSnapshots: [] });

            expect(lastPatch().parentPetSnapshots).toEqual([]);
        });

        it('엄마가 2개면 거부한다', async () => {
            await expect(
                useCase.execute('user-1', 'pet-1', {
                    parentPetSnapshots: [
                        { relation: 'mother', breed: 'A', name: '엄마1' },
                        { relation: 'mother', breed: 'B', name: '엄마2' },
                    ],
                }),
            ).rejects.toThrow('엄마 정보는 1개까지만 등록할 수 있습니다.');
            expect(writerPort.updateByOwner).not.toHaveBeenCalled();
        });
    });

    describe('사육 환경', () => {
        it('photoFileNames 가 photoFileName 보다 우선하고 첫 장을 하위 호환 필드로 함께 저장한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                breedingEnvironment: {
                    description: '  온습도 일정한 전용 사육장  ',
                    photoFileNames: ['env-1.jpg', 'env-2.jpg'],
                    photoFileName: '무시되는-단일.jpg',
                },
            });

            expect(lastPatch().breedingEnvironment).toEqual({
                description: '온습도 일정한 전용 사육장',
                photoFileName: 'env-1.jpg',
                photoFileNames: ['env-1.jpg', 'env-2.jpg'],
            });
        });

        it('배열 없이 단일 photoFileName 만 오면 배열로 승격한다', async () => {
            await useCase.execute('user-1', 'pet-1', {
                breedingEnvironment: { photoFileName: 'env.jpg' },
            });

            expect(lastPatch().breedingEnvironment).toEqual({
                description: undefined,
                photoFileName: 'env.jpg',
                photoFileNames: ['env.jpg'],
            });
        });

        it('설명도 사진도 없는 객체는 사육 환경 제거(null)로 해석한다', async () => {
            await useCase.execute('user-1', 'pet-1', { breedingEnvironment: {} });

            expect(lastPatch().breedingEnvironment).toBeNull();
        });
    });
});
