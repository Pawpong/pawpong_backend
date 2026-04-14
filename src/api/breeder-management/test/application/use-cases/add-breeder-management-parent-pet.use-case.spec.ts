import { BadRequestException } from '@nestjs/common';

import { AddBreederManagementParentPetUseCase } from '../../../application/use-cases/add-breeder-management-parent-pet.use-case';
import { BreederManagementParentPetCommandMapperService } from '../../../domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementParentPetCommandResultMapperService } from '../../../domain/services/breeder-management-parent-pet-command-result-mapper.service';

describe('브리더 부모견/부모묘 추가 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementPetCommandPort = {
        createParentPet: jest.fn(),
    };

    const useCase = new AddBreederManagementParentPetUseCase(
        breederManagementProfilePort as any,
        breederManagementPetCommandPort as any,
        new BreederManagementParentPetCommandMapperService(),
        new BreederManagementParentPetCommandResultMapperService(),
    );

    const mockBreeder = { _id: 'breeder-1', name: '행복브리더' };
    const mockParentPetDto = {
        name: '행복이',
        petType: 'dog',
        breed: '말티즈',
        gender: 'male',
        birthDate: '2022-01-01',
        color: '흰색',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 부모견을 등록한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);
        breederManagementPetCommandPort.createParentPet.mockResolvedValue({ _id: 'pet-1' });

        const result = await useCase.execute('breeder-1', mockParentPetDto as any);

        expect(result.petId).toBe('pet-1');
        expect(result.message).toBeDefined();
        expect(breederManagementProfilePort.findById).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementPetCommandPort.createParentPet).toHaveBeenCalled();
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', mockParentPetDto as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id', mockParentPetDto as any)).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.createParentPet).not.toHaveBeenCalled();
    });
});
