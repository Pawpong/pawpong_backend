import { ConflictException } from '@nestjs/common';

import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { CreateBreedUseCase } from './create-breed.use-case';
import { BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { BreedWriterPort } from '../ports/breed-writer.port';

describe('CreateBreedUseCase', () => {
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
            new BreedAdminPresentationService(),
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

    it('중복 카테고리가 있으면 ConflictException을 던진다', async () => {
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
            new BreedAdminPresentationService(),
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
