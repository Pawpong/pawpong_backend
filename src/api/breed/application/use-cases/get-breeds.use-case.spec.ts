import { GetBreedsUseCase } from './get-breeds.use-case';
import { BreedCatalogService } from '../../domain/services/breed-catalog.service';
import { BreedReaderPort } from '../ports/breed-reader.port';

describe('GetBreedsUseCase', () => {
    it('품종 조회 결과를 응답 DTO로 조립한다', async () => {
        const breedReader: BreedReaderPort = {
            readByPetType: jest.fn().mockResolvedValue([
                {
                    category: '소형견',
                    categoryDescription: '10kg 미만',
                    breeds: ['포메라니안', '말티즈'],
                },
            ]),
        };
        const useCase = new GetBreedsUseCase(breedReader, new BreedCatalogService());

        const result = await useCase.execute('dog');

        expect(result).toEqual({
            petType: 'dog',
            categories: [
                {
                    category: '소형견',
                    categoryDescription: '10kg 미만',
                    breeds: ['포메라니안', '말티즈'],
                },
            ],
        });
        expect(breedReader.readByPetType).toHaveBeenCalledWith('dog');
    });
});
