import { BadRequestException } from '@nestjs/common';

import type { BreederPetPostingEditSnapshot } from '../../../application/ports/breeder-pet-posting-reader.port';
import { GetBreederPetPostingForEditUseCase } from '../../../application/use-cases/get-breeder-pet-posting-for-edit.use-case';
import { BreederPetPostingEditFormMapperService } from '../../../domain/services/breeder-pet-posting-edit-form-mapper.service';

describe('GetBreederPetPostingForEditUseCase', () => {
    const profilePort = { findById: jest.fn() };
    const readerPort = { listMyPostings: jest.fn(), findEditSnapshotByOwner: jest.fn() };
    // 파일키 -> URL 변환이 눈에 보이도록 접두사만 붙인다
    const assetUrlPort = { toSignedUrl: jest.fn((fileName: string) => `https://cdn.test/${fileName}`) };

    const mapper = new BreederPetPostingEditFormMapperService(assetUrlPort);
    const useCase = new GetBreederPetPostingForEditUseCase(profilePort as any, readerPort as any, mapper);

    const baseSnapshot = (): BreederPetPostingEditSnapshot => ({
        petId: 'pet-1',
        name: '레오파드게코 도마뱀(만다린)',
        breed: '레오파드게코',
        petType: 'reptile',
        gender: 'female',
        birthDate: new Date('2024-11-05'),
        price: 200000,
        description: '귀여운 파이리',
        photos: ['available-pets/abc/1.jpg', 'available-pets/abc/2.jpg'],
        representativePhotoIndex: 1,
        status: 'available',
        vaccinationStatus: 'completed',
        vaccinationRecords: [{ name: '종합백신', date: new Date('2024-12-01'), round: 1 }],
        vaccinationIncompleteReason: undefined,
        geneticTestStatus: 'incomplete',
        geneticTestRecords: [],
        geneticTestIncompleteReason: '태어난지 한달도 안됨',
        parentPetSnapshots: [
            {
                relation: 'mother',
                breed: '레오파드게코',
                name: '마망',
                birthDate: new Date('2020-04-10'),
                photoFileName: 'available-pets/abc/mother.jpg',
            },
            { relation: 'father', breed: '레오파드게코', name: '파팡' },
        ],
        breedingEnvironment: {
            description: '온습도 일정한 전용 사육장',
            photoFileName: 'available-pets/abc/env-1.jpg',
            photoFileNames: ['available-pets/abc/env-1.jpg', 'available-pets/abc/env-2.jpg'],
        },
        updatedAt: new Date('2026-08-17T10:30:00.000Z'),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue({ breederId: 'breeder-1', petType: 'reptile' });
        readerPort.findEditSnapshotByOwner.mockResolvedValue(baseSnapshot());
    });

    it('브리더가 존재하지 않으면 BadRequest', async () => {
        profilePort.findById.mockResolvedValueOnce(null);

        await expect(useCase.execute('user-1', 'pet-1')).rejects.toThrow(BadRequestException);
        expect(readerPort.findEditSnapshotByOwner).not.toHaveBeenCalled();
    });

    it('본인 글이 아니거나 없으면 BadRequest — 소유 여부를 구분해 노출하지 않는다', async () => {
        readerPort.findEditSnapshotByOwner.mockResolvedValueOnce(null);

        await expect(useCase.execute('user-1', 'pet-1')).rejects.toThrow('해당 분양글을 찾을 수 없습니다.');
    });

    it('소유자 검증은 조회한 브리더 ID 로 수행한다', async () => {
        await useCase.execute('user-1', 'pet-1');

        expect(readerPort.findEditSnapshotByOwner).toHaveBeenCalledWith('pet-1', 'breeder-1');
    });

    it('form 은 파일키를 그대로 담는다 — PATCH 로 되돌려 보낼 수 있어야 한다', async () => {
        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.form.photos).toEqual(['available-pets/abc/1.jpg', 'available-pets/abc/2.jpg']);
        expect(result.form.parentPetSnapshots[0].photoFileName).toBe('available-pets/abc/mother.jpg');
        expect(result.form.breedingEnvironment?.photoFileNames).toEqual([
            'available-pets/abc/env-1.jpg',
            'available-pets/abc/env-2.jpg',
        ]);
    });

    it('표시용 가공을 하지 않는다 — price 는 숫자, 날짜는 YYYY-MM-DD, relation 은 원본값', async () => {
        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.form.price).toBe(200000);
        expect(result.form.birthDate).toBe('2024-11-05');
        expect(result.form.vaccinationRecords[0].date).toBe('2024-12-01');
        expect(result.form.parentPetSnapshots[0].relation).toBe('mother');
        expect(result.form.parentPetSnapshots[0].birthDate).toBe('2020-04-10');
    });

    it('photoUrls 는 form 의 파일키와 같은 순서로 내려간다', async () => {
        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.photoUrls.pet).toEqual([
            'https://cdn.test/available-pets/abc/1.jpg',
            'https://cdn.test/available-pets/abc/2.jpg',
        ]);
        expect(result.photoUrls.breedingEnvironmentPhotos).toEqual([
            'https://cdn.test/available-pets/abc/env-1.jpg',
            'https://cdn.test/available-pets/abc/env-2.jpg',
        ]);
        // 임시저장 조회와 동일하게 단일 필드는 첫 장
        expect(result.photoUrls.breedingEnvironment).toBe('https://cdn.test/available-pets/abc/env-1.jpg');
    });

    it('사진 없는 부모 행은 null 로 자리를 지킨다 — 순서가 밀리면 안 된다', async () => {
        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.photoUrls.parents).toEqual(['https://cdn.test/available-pets/abc/mother.jpg', null]);
    });

    it('배열 도입 전 저장된 사육환경(단일 photoFileName)도 배열로 승격해 내려준다', async () => {
        readerPort.findEditSnapshotByOwner.mockResolvedValueOnce({
            ...baseSnapshot(),
            breedingEnvironment: { description: '레거시', photoFileName: 'available-pets/abc/legacy.jpg' },
        });

        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.form.breedingEnvironment?.photoFileNames).toEqual(['available-pets/abc/legacy.jpg']);
        expect(result.photoUrls.breedingEnvironmentPhotos).toEqual(['https://cdn.test/available-pets/abc/legacy.jpg']);
    });

    it('사육 환경이 없으면 URL 은 null / 빈 배열', async () => {
        readerPort.findEditSnapshotByOwner.mockResolvedValueOnce({
            ...baseSnapshot(),
            breedingEnvironment: undefined,
        });

        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.form.breedingEnvironment).toBeUndefined();
        expect(result.photoUrls.breedingEnvironment).toBeNull();
        expect(result.photoUrls.breedingEnvironmentPhotos).toEqual([]);
    });

    it('status 와 updatedAt(ISO 8601) 을 함께 내려준다', async () => {
        const result = await useCase.execute('user-1', 'pet-1');

        expect(result.petId).toBe('pet-1');
        expect(result.status).toBe('available');
        expect(result.updatedAt).toBe('2026-08-17T10:30:00.000Z');
    });
});
