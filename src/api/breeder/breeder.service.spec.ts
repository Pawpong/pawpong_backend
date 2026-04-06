import { BreederService } from './breeder.service';

describe('BreederService', () => {
    const searchBreedersUseCase = { execute: jest.fn() };
    const getBreederProfileUseCase = { execute: jest.fn() };
    const getBreederReviewsUseCase = { execute: jest.fn() };
    const getBreederPetsUseCase = { execute: jest.fn() };
    const getBreederPetDetailUseCase = { execute: jest.fn() };
    const getBreederParentPetsUseCase = { execute: jest.fn() };
    const getBreederApplicationFormUseCase = { execute: jest.fn() };

    const service = new BreederService(
        searchBreedersUseCase as any,
        getBreederProfileUseCase as any,
        getBreederReviewsUseCase as any,
        getBreederPetsUseCase as any,
        getBreederPetDetailUseCase as any,
        getBreederParentPetsUseCase as any,
        getBreederApplicationFormUseCase as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 검색을 검색 유스케이스에 위임한다', async () => {
        searchBreedersUseCase.execute.mockResolvedValue({ items: [] });

        await expect(service.searchBreeders({} as any)).resolves.toEqual({ items: [] });
        expect(searchBreedersUseCase.execute).toHaveBeenCalledWith({});
    });

    it('브리더 프로필 조회를 프로필 유스케이스에 위임한다', async () => {
        getBreederProfileUseCase.execute.mockResolvedValue({ breederId: 'breeder-1' });

        await expect(service.getBreederProfile('breeder-1', 'user-1')).resolves.toEqual({
            breederId: 'breeder-1',
        });
        expect(getBreederProfileUseCase.execute).toHaveBeenCalledWith('breeder-1', 'user-1');
    });

    it('브리더 후기 목록 조회를 후기 유스케이스에 위임한다', async () => {
        getBreederReviewsUseCase.execute.mockResolvedValue({ items: [] });

        await expect(service.getBreederReviews('breeder-1', 2, 5)).resolves.toEqual({ items: [] });
        expect(getBreederReviewsUseCase.execute).toHaveBeenCalledWith('breeder-1', 2, 5);
    });

    it('브리더 개체 상세 조회를 상세 유스케이스에 위임한다', async () => {
        getBreederPetDetailUseCase.execute.mockResolvedValue({ petId: 'pet-1' });

        await expect(service.getPetDetail('breeder-1', 'pet-1')).resolves.toEqual({ petId: 'pet-1' });
        expect(getBreederPetDetailUseCase.execute).toHaveBeenCalledWith('breeder-1', 'pet-1');
    });

    it('부모견 목록 조회를 부모견 유스케이스에 위임한다', async () => {
        getBreederParentPetsUseCase.execute.mockResolvedValue({ items: [] });

        await expect(service.getParentPets('breeder-1', 1, 10)).resolves.toEqual({ items: [] });
        expect(getBreederParentPetsUseCase.execute).toHaveBeenCalledWith('breeder-1', 1, 10);
    });

    it('브리더 개체 목록 조회를 개체 유스케이스에 위임한다', async () => {
        getBreederPetsUseCase.execute.mockResolvedValue({ items: [] });

        await expect(service.getBreederPets('breeder-1', 'available', 1, 20)).resolves.toEqual({ items: [] });
        expect(getBreederPetsUseCase.execute).toHaveBeenCalledWith('breeder-1', 'available', 1, 20);
    });

    it('입양 신청 폼 조회를 폼 유스케이스에 위임한다', async () => {
        getBreederApplicationFormUseCase.execute.mockResolvedValue({ customQuestions: [] });

        await expect(service.getApplicationForm('breeder-1')).resolves.toEqual({ customQuestions: [] });
        expect(getBreederApplicationFormUseCase.execute).toHaveBeenCalledWith('breeder-1');
    });
});
