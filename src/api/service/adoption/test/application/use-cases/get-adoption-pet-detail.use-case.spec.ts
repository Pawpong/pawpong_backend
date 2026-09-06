import { ApplicationStatus } from '../../../../../../common/enum/user.enum';
import { GetAdoptionPetDetailUseCase } from '../../../application/use-cases/get-adoption-pet-detail.use-case';
import { AdoptionPetMapperService } from '../../../domain/services/adoption-pet-mapper.service';

describe('분양 상세 — 내 신청 상태 노출', () => {
    const petReader = { readByIdDetailed: jest.fn() };
    const petWriter = { incrementViewCount: jest.fn() };
    const favoriteReader = { findFavoritedPetIds: jest.fn() };
    const assetUrlPort = { generateSignedUrl: jest.fn() };
    const breederSummaryPort = { readSummary: jest.fn() };
    const recordReader = { findMyBlockingApplicationForPet: jest.fn(), listMyAdopted: jest.fn() };

    const useCase = new GetAdoptionPetDetailUseCase(
        petReader as any,
        petWriter as any,
        favoriteReader as any,
        assetUrlPort as any,
        breederSummaryPort as any,
        recordReader as any,
        new AdoptionPetMapperService(),
    );

    const detail = {
        id: 'pet-1',
        breederId: 'breeder-1',
        name: '레오',
        breed: '말티즈',
        petType: 'dog',
        gender: 'female',
        birthDate: new Date('2025-01-01'),
        price: 1000000,
        status: 'available',
        photos: [],
        inquiryCount: 0,
        favoriteCount: 0,
        viewCount: 3,
        chatCount: 0,
        createdAt: new Date('2025-06-01'),
        updatedAt: new Date('2025-06-01'),
        vaccinationRecords: [],
        geneticTestRecords: [],
        parentPetSnapshots: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        petReader.readByIdDetailed.mockResolvedValue(detail);
        petWriter.incrementViewCount.mockResolvedValue(4);
        favoriteReader.findFavoritedPetIds.mockResolvedValue(new Set<string>());
        breederSummaryPort.readSummary.mockResolvedValue(null);
        recordReader.findMyBlockingApplicationForPet.mockResolvedValue(null);
    });

    it('입양자가 이미 신청했으면 신청 id 와 상태를 함께 내려준다', async () => {
        recordReader.findMyBlockingApplicationForPet.mockResolvedValue({
            applicationId: 'app-1',
            status: ApplicationStatus.CONSULTATION_PENDING,
        });

        const result = await useCase.execute({ petId: 'pet-1', viewerUserId: 'adopter-1' });

        expect(recordReader.findMyBlockingApplicationForPet).toHaveBeenCalledWith('adopter-1', 'pet-1');
        expect(result.myApplicationId).toBe('app-1');
        expect(result.myApplicationStatus).toBe(ApplicationStatus.CONSULTATION_PENDING);
    });

    it('신청이 없으면 두 필드 모두 undefined', async () => {
        const result = await useCase.execute({ petId: 'pet-1', viewerUserId: 'adopter-1' });

        expect(result.myApplicationId).toBeUndefined();
        expect(result.myApplicationStatus).toBeUndefined();
    });

    it('비로그인은 조회 자체를 하지 않는다', async () => {
        const result = await useCase.execute({ petId: 'pet-1' });

        expect(recordReader.findMyBlockingApplicationForPet).not.toHaveBeenCalled();
        expect(result.myApplicationId).toBeUndefined();
    });

    it('브리더도 신청 주체이므로 역할로 막지 않는다', async () => {
        // 브리더는 v1 경로(POST /v2/adopter/application)로 다른 브리더의 펫에 신청할 수 있고,
        // 그 신청도 같은 재신청 차단(409)에 걸린다. 역할로 막으면 버튼이 계속 활성으로 남는다.
        recordReader.findMyBlockingApplicationForPet.mockResolvedValue({
            applicationId: 'app-9',
            status: ApplicationStatus.CONSULTATION_PENDING,
        });

        const result = await useCase.execute({ petId: 'pet-1', viewerUserId: 'breeder-1' });

        expect(recordReader.findMyBlockingApplicationForPet).toHaveBeenCalledWith('breeder-1', 'pet-1');
        expect(result.myApplicationId).toBe('app-9');
        expect(result.myApplicationStatus).toBe(ApplicationStatus.CONSULTATION_PENDING);
    });

    it('자기 분양글을 보는 브리더는 자기 펫에 낸 신청이 없어 자연히 undefined 다', async () => {
        recordReader.findMyBlockingApplicationForPet.mockResolvedValue(null);

        const result = await useCase.execute({ petId: 'pet-1', viewerUserId: 'breeder-1' });

        expect(result.myApplicationId).toBeUndefined();
        expect(result.myApplicationStatus).toBeUndefined();
    });

    it('내 신청 조회가 즐겨찾기 조회를 막지 않는다 (같은 병렬 구간)', async () => {
        favoriteReader.findFavoritedPetIds.mockResolvedValue(new Set(['pet-1']));
        recordReader.findMyBlockingApplicationForPet.mockResolvedValue({
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_APPROVED,
        });

        const result = await useCase.execute({ petId: 'pet-1', viewerUserId: 'adopter-1' });

        expect(result.isFavorited).toBe(true);
        expect(result.myApplicationId).toBe('app-1');
    });
});
