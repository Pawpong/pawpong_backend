import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { GetBreederProfileUseCase } from '../../../application/use-cases/get-breeder-profile.use-case';
import { BreederBirthDateFormatterService } from '../../../domain/services/breeder-birth-date-formatter.service';
import { BreederPublicProfileAssemblerService } from '../../../domain/services/breeder-public-profile-assembler.service';

describe('브리더 프로필 공개 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
        findAdopterFavoriteBreederIds: jest.fn(),
        findBreederFavoriteBreederIds: jest.fn(),
        findActiveAvailablePetsByBreederId: jest.fn(),
        findActiveParentPetsByBreederId: jest.fn(),
        incrementProfileViews: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetBreederProfileUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederPublicProfileAssemblerService(new BreederBirthDateFormatterService()),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        nickname: '행복브리더',
        petType: 'dog',
        breeds: ['말티즈'],
        accountStatus: 'active',
        verification: { status: 'approved', plan: 'basic', level: 'new', documents: [] },
        profile: {
            location: { city: '서울', district: '강남구' },
            specialization: ['dog'],
            representativePhotos: [],
            priceRange: null,
            introduction: '안녕하세요.',
        },
        stats: { averageRating: 4.5, totalReviews: 10, completedAdoptions: 5 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('비로그인 상태로 브리더 프로필을 조회한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([]);
        breederPublicReaderPort.findActiveParentPetsByBreederId.mockResolvedValue([]);

        const result = await useCase.execute('breeder-1');

        expect(result).toBeDefined();
        expect(breederPublicReaderPort.incrementProfileViews).not.toHaveBeenCalled();
    });

    it('로그인 상태에서 조회하면 프로필 뷰를 증가시킨다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findAdopterFavoriteBreederIds.mockResolvedValue([]);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([]);
        breederPublicReaderPort.findActiveParentPetsByBreederId.mockResolvedValue([]);
        breederPublicReaderPort.incrementProfileViews.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'adopter-1');

        expect(breederPublicReaderPort.incrementProfileViews).toHaveBeenCalledWith('breeder-1');
    });

    it('즐겨찾기한 브리더면 isFavorited가 true를 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findAdopterFavoriteBreederIds.mockResolvedValue(['breeder-1']);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([]);
        breederPublicReaderPort.findActiveParentPetsByBreederId.mockResolvedValue([]);
        breederPublicReaderPort.incrementProfileViews.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'adopter-1');

        expect(result.isFavorited).toBe(true);
    });

    it('탈퇴한 브리더는 DomainValidationError를 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue({
            ...mockBreeder,
            accountStatus: 'deleted',
        });

        await expect(useCase.execute('breeder-1')).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1')).rejects.toThrow('탈퇴한 브리더의 프로필은 조회할 수 없습니다.');
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
