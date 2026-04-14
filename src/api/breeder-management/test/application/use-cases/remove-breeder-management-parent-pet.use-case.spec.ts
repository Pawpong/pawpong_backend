import { BadRequestException } from '@nestjs/common';

import { RemoveBreederManagementParentPetUseCase } from '../../../application/use-cases/remove-breeder-management-parent-pet.use-case';
import { BreederManagementParentPetCommandResultMapperService } from '../../../domain/services/breeder-management-parent-pet-command-result-mapper.service';

describe('브리더 부모견/부모묘 삭제 유스케이스', () => {
    const breederManagementPetCommandPort = {
        findParentPetByIdAndBreeder: jest.fn(),
        deleteParentPet: jest.fn(),
    };

    const useCase = new RemoveBreederManagementParentPetUseCase(
        breederManagementPetCommandPort as any,
        new BreederManagementParentPetCommandResultMapperService(),
    );

    const mockParentPet = { _id: 'pet-1', name: '행복이', breederId: 'breeder-1' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 부모견을 삭제한다', async () => {
        breederManagementPetCommandPort.findParentPetByIdAndBreeder.mockResolvedValue(mockParentPet);
        breederManagementPetCommandPort.deleteParentPet.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'pet-1');

        expect(result.message).toBeDefined();
        expect(breederManagementPetCommandPort.findParentPetByIdAndBreeder).toHaveBeenCalledWith('pet-1', 'breeder-1');
        expect(breederManagementPetCommandPort.deleteParentPet).toHaveBeenCalledWith('pet-1');
    });

    it('해당 부모견을 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementPetCommandPort.findParentPetByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow(
            '해당 부모견/부모묘를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.deleteParentPet).not.toHaveBeenCalled();
    });
});
