import { BadRequestException } from '@nestjs/common';

import { AddBreederManagementAvailablePetUseCase } from '../../../application/use-cases/add-breeder-management-available-pet.use-case';
import { BreederManagementAvailablePetCommandMapperService } from '../../../domain/services/breeder-management-available-pet-command-mapper.service';
import { BreederManagementAvailablePetCommandResultMapperService } from '../../../domain/services/breeder-management-available-pet-command-result-mapper.service';

describe('브리더 분양 개체 추가 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementPetCommandPort = {
        createAvailablePet: jest.fn(),
    };

    const useCase = new AddBreederManagementAvailablePetUseCase(
        breederManagementProfilePort as any,
        breederManagementPetCommandPort as any,
        new BreederManagementAvailablePetCommandMapperService(),
        new BreederManagementAvailablePetCommandResultMapperService(),
    );

    const mockBreeder = { _id: 'breeder-1', name: '행복브리더' };
    const mockAvailablePetDto = {
        name: '뭉치',
        petType: 'dog',
        breed: '말티즈',
        gender: 'male',
        birthDate: '2024-01-01',
        color: '흰색',
        price: 1500000,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 분양 개체를 등록한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementPetCommandPort.createAvailablePet.mockResolvedValue({ _id: 'pet-2' });

        const result = await useCase.execute('breeder-1', mockAvailablePetDto as any);

        expect(result.petId).toBe('pet-2');
        expect(result.message).toBeDefined();
        expect(breederManagementProfilePort.findById).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementPetCommandPort.createAvailablePet).toHaveBeenCalled();
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', mockAvailablePetDto as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', mockAvailablePetDto as any)).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.createAvailablePet).not.toHaveBeenCalled();
    });
});
