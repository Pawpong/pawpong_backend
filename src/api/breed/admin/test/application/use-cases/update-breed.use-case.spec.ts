import { DomainConflictError, DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { BreedAdminResultMapperService } from '../../../../domain/services/breed-admin-result-mapper.service';
import { UpdateBreedUseCase } from '../../../application/use-cases/update-breed.use-case';
import { BreedAdminReaderPort } from '../../../application/ports/breed-admin-reader.port';
import { BreedWriterPort } from '../../../application/ports/breed-writer.port';

describe('품종 수정 유스케이스', () => {
    const existingBreed = {
        id: 'breed-1',
        petType: 'dog',
        category: '소형견',
        categoryDescription: '10kg 미만',
        breeds: ['말티즈'],
        createdAt: new Date('2026-04-06T00:00:00.000Z'),
        updatedAt: new Date('2026-04-06T00:00:00.000Z'),
    };

    it('품종 카테고리가 있으면 수정된 응답을 반환한다', async () => {
        const breedAdminReader: BreedAdminReaderPort = {
            readAll: jest.fn(),
            findById: jest.fn().mockResolvedValue(existingBreed),
            findByPetTypeAndCategory: jest.fn().mockResolvedValue(null),
        };
        const breedWriter: BreedWriterPort = {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue({
                ...existingBreed,
                category: '중형견',
            }),
            delete: jest.fn(),
        };
        const useCase = new UpdateBreedUseCase(breedAdminReader, breedWriter, new BreedAdminResultMapperService());

        await expect(useCase.execute('breed-1', { category: '중형견' })).resolves.toMatchObject({
            id: 'breed-1',
            category: '중형견',
        });
    });

    it('대상이 없으면 예외을 던진다', async () => {
        const useCase = new UpdateBreedUseCase(
            {
                readAll: jest.fn(),
                findById: jest.fn().mockResolvedValue(null),
                findByPetTypeAndCategory: jest.fn(),
            },
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new BreedAdminResultMapperService(),
        );

        await expect(useCase.execute('missing', { category: '중형견' })).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('중복 카테고리면 예외을 던진다', async () => {
        const useCase = new UpdateBreedUseCase(
            {
                readAll: jest.fn(),
                findById: jest.fn().mockResolvedValue(existingBreed),
                findByPetTypeAndCategory: jest.fn().mockResolvedValue({
                    ...existingBreed,
                    id: 'breed-2',
                    category: '중형견',
                }),
            },
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new BreedAdminResultMapperService(),
        );

        await expect(useCase.execute('breed-1', { category: '중형견' })).rejects.toBeInstanceOf(DomainConflictError);
    });
});
