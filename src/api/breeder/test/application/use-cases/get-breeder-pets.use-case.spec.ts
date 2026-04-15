import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { GetBreederPetsUseCase } from '../../../application/use-cases/get-breeder-pets.use-case';
import { BreederPublicPetPageAssemblerService } from '../../../domain/services/breeder-public-pet-page-assembler.service';
import { BreederBirthDateFormatterService } from '../../../domain/services/breeder-birth-date-formatter.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

describe('브리더 분양 개체 목록 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
        findActiveAvailablePetsByBreederId: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetBreederPetsUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederPublicPetPageAssemblerService(
            new BreederBirthDateFormatterService(),
            new BreederPaginationAssemblerService(),
        ),
    );

    const mockBreeder = { _id: 'breeder-1', accountStatus: 'active' };
    const mockPet = {
        _id: { toString: () => 'pet-1' },
        name: '뭉치',
        breed: '말티즈',
        gender: 'male',
        birthDate: new Date('2024-01-01'),
        price: 1500000,
        status: 'available',
        photos: ['photo.jpg'],
        parentInfo: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('정상적으로 분양 개체 목록을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([mockPet]);

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(1);
        expect(breederPublicReaderPort.findPublicBreederById).toHaveBeenCalledWith('breeder-1');
    });

    it('개체가 없으면 빈 배열을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([]);

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(0);
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
