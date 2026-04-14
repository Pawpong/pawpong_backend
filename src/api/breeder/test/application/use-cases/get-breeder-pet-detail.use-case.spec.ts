import { BadRequestException } from '@nestjs/common';

import { GetBreederPetDetailUseCase } from '../../../application/use-cases/get-breeder-pet-detail.use-case';
import { BreederPublicPetDetailAssemblerService } from '../../../domain/services/breeder-public-pet-detail-assembler.service';

describe('브리더 분양 개체 상세 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
        findActiveAvailablePetsByBreederId: jest.fn(),
    };

    const useCase = new GetBreederPetDetailUseCase(
        breederPublicReaderPort as any,
        new BreederPublicPetDetailAssemblerService(),
    );

    const mockBreeder = { _id: 'breeder-1', accountStatus: 'active' };
    const mockPet = {
        _id: { toString: () => 'pet-1' },
        name: '뭉치',
        breed: '말티즈',
        gender: 'male',
        birthDate: '2024-01-01',
        description: '건강한 개체입니다.',
        price: 1500000,
        status: 'available',
        photos: ['photo.jpg'],
        vaccinations: [],
        healthRecords: [],
        parentInfo: { father: null, mother: null },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 분양 개체 상세를 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([mockPet]);

        const result = await useCase.execute('breeder-1', 'pet-1');

        expect(result.petId).toBe('pet-1');
        expect(result.name).toBe('뭉치');
        expect(result.status).toBe('available');
    });

    it('해당 반려동물을 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveAvailablePetsByBreederId.mockResolvedValue([mockPet]);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow('반려동물을 찾을 수 없습니다.');
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', 'pet-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', 'pet-1')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
