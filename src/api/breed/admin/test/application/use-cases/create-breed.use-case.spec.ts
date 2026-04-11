import { ConflictException } from '@nestjs/common';

import { BreedAdminResultMapperService } from '../../../../domain/services/breed-admin-result-mapper.service';
import { CreateBreedUseCase } from '../../../application/use-cases/create-breed.use-case';
import { BreedAdminReaderPort } from '../../../application/ports/breed-admin-reader.port';
import { BreedWriterPort } from '../../../application/ports/breed-writer.port';

describe('품종 생성 유스케이스', () => {
    it('중복 카테고리가 없으면 품종 카테고리를 생성한다', async () => {
        const breedAdminReader: BreedAdminReaderPort = {
            readAll: jest.fn(),
            findById: jest.fn(),
            findByPetTypeAndCategory: jest.fn().mockResolvedValue(null),
        };
        const breedWriter: BreedWriterPort = {
            create: jest.fn().mockResolvedValue({
                id: 'breed-1',
                petType: 'dog',
                category: '소형견',
                categoryDescription: '10kg 미만',
                breeds: ['말티즈'],
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const useCase = new CreateBreedUseCase(
            breedAdminReader,
            breedWriter,
            new BreedAdminResultMapperService(),
        );

        await expect(
            useCase.execute({
                petType: 'dog',
                category: '소형견',
                categoryDescription: '10kg 미만',
                breeds: ['말티즈'],
            }),
        ).resolves.toMatchObject({
            petType: 'dog',
            category: '소형견',
        });
    });

    it('중복 카테고리가 있으면 예외을 던진다', async () => {
        const useCase = new CreateBreedUseCase(
            {
                readAll: jest.fn(),
                findById: jest.fn(),
                findByPetTypeAndCategory: jest.fn().mockResolvedValue({
                    id: 'breed-1',
                    petType: 'dog',
                    category: '소형견',
                    categoryDescription: '10kg 미만',
                    breeds: ['말티즈'],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            },
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new BreedAdminResultMapperService(),
        );

        await expect(
            useCase.execute({
                petType: 'dog',
                category: '소형견',
                categoryDescription: '10kg 미만',
                breeds: ['말티즈'],
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});
