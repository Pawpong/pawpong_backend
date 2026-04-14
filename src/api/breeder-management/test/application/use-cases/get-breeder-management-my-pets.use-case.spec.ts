import { BadRequestException } from '@nestjs/common';

import { GetBreederManagementMyPetsUseCase } from '../../../application/use-cases/get-breeder-management-my-pets.use-case';
import { BreederManagementMyPetMapperService } from '../../../domain/services/breeder-management-my-pet-mapper.service';
import { BreederManagementPaginationAssemblerService } from '../../../domain/services/breeder-management-pagination-assembler.service';

describe('브리더 내 반려동물 목록 조회 유스케이스', () => {
    const breederManagementListReaderPort = {
        findBreederSummary: jest.fn(),
        findMyPetsSnapshot: jest.fn(),
    };

    const useCase = new GetBreederManagementMyPetsUseCase(
        breederManagementListReaderPort as any,
        new BreederManagementMyPetMapperService(),
        new BreederManagementPaginationAssemblerService(),
    );

    const mockBreederSummary = { _id: 'breeder-1', name: '행복브리더', averageRating: 4.5 };
    const mockPet = {
        _id: 'pet-1',
        petId: 'pet-1',
        name: '뭉치',
        breed: '말티즈',
        gender: 'male',
        birthDate: '2024-01-01',
        price: 1500000,
        status: 'available',
        isActive: true,
        photos: ['photo1.jpg'],
        viewCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 개체 목록을 페이지네이션하여 반환한다', async () => {
        const applicationCountMap = new Map([['pet-1', 2]]);
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(mockBreederSummary);
        breederManagementListReaderPort.findMyPetsSnapshot.mockResolvedValue({
            pets: [mockPet],
            total: 1,
            applicationCountMap,
            availableCount: 1,
            reservedCount: 0,
            adoptedCount: 0,
            inactiveCount: 0,
        });

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(1);
        expect(result.items[0].petId).toBe('pet-1');
        expect(result.items[0].applicationCount).toBe(2);
        expect(result.availableCount).toBe(1);
        expect(result.pagination.totalItems).toBe(1);
    });

    it('status 필터를 포트에 전달한다', async () => {
        const applicationCountMap = new Map<string, number>();
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(mockBreederSummary);
        breederManagementListReaderPort.findMyPetsSnapshot.mockResolvedValue({
            pets: [],
            total: 0,
            applicationCountMap,
            availableCount: 0,
            reservedCount: 0,
            adoptedCount: 0,
            inactiveCount: 0,
        });

        await useCase.execute('breeder-1', 'available', false, 1, 20);

        expect(breederManagementListReaderPort.findMyPetsSnapshot).toHaveBeenCalledWith(
            'breeder-1',
            expect.objectContaining({ status: 'available' }),
        );
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(breederManagementListReaderPort.findMyPetsSnapshot).not.toHaveBeenCalled();
    });
});
