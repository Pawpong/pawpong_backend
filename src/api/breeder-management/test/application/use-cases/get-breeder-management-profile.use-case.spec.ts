import { BadRequestException } from '@nestjs/common';

import { GetBreederManagementProfileUseCase } from '../../../application/use-cases/get-breeder-management-profile.use-case';
import { BreederManagementProfileAssemblerService } from '../../../domain/services/breeder-management-profile-assembler.service';

describe('브리더 프로필 조회 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
        findActiveParentPetsByBreederId: jest.fn(),
        findActiveAvailablePetsByBreederId: jest.fn(),
    };
    const breederManagementFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/file.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetBreederManagementProfileUseCase(
        breederManagementProfilePort as any,
        breederManagementFileUrlPort as any,
        new BreederManagementProfileAssemblerService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        emailAddress: 'breeder@test.com',
        verification: { status: 'approved', plan: 'basic', documents: [] },
        profile: {
            location: { city: '서울', district: '강남구' },
            specialization: ['dog'],
            representativePhotos: [],
            priceRange: null,
        },
        stats: { averageRating: 4.5, totalReviews: 5 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederManagementFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/file.jpg');
        breederManagementFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederManagementFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('정상적으로 브리더 프로필을 반환한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.findActiveParentPetsByBreederId.mockResolvedValue([]);
        breederManagementProfilePort.findActiveAvailablePetsByBreederId.mockResolvedValue([]);

        const result = await useCase.execute('breeder-1');

        expect(result).toBeDefined();
        expect(breederManagementProfilePort.findById).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementProfilePort.findActiveParentPetsByBreederId).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementProfilePort.findActiveAvailablePetsByBreederId).toHaveBeenCalledWith('breeder-1');
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(breederManagementProfilePort.findActiveParentPetsByBreederId).not.toHaveBeenCalled();
    });
});
