import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { UpdateBreederManagementParentPetUseCase } from '../../../application/use-cases/update-breeder-management-parent-pet.use-case';
import { BreederManagementParentPetCommandMapperService } from '../../../domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementParentPetCommandResultMapperService } from '../../../domain/services/breeder-management-parent-pet-command-result-mapper.service';

describe('브리더 부모견/부모묘 수정 유스케이스', () => {
    const breederManagementPetCommandPort = {
        findParentPetByIdAndBreeder: jest.fn(),
        updateParentPet: jest.fn(),
    };

    const useCase = new UpdateBreederManagementParentPetUseCase(
        breederManagementPetCommandPort as any,
        new BreederManagementParentPetCommandMapperService(),
        new BreederManagementParentPetCommandResultMapperService(),
    );

    const mockParentPet = { _id: 'pet-1', name: '행복이', breederId: 'breeder-1' };
    const mockUpdateData = { name: '행복이2', color: '회색' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 부모견 정보를 수정한다', async () => {
        breederManagementPetCommandPort.findParentPetByIdAndBreeder.mockResolvedValue(mockParentPet);
        breederManagementPetCommandPort.updateParentPet.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'pet-1', mockUpdateData as any);

        expect(result.message).toBeDefined();
        expect(breederManagementPetCommandPort.findParentPetByIdAndBreeder).toHaveBeenCalledWith('pet-1', 'breeder-1');
        expect(breederManagementPetCommandPort.updateParentPet).toHaveBeenCalledWith('pet-1', expect.any(Object));
    });

    it('해당 부모견을 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementPetCommandPort.findParentPetByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet', mockUpdateData as any)).rejects.toThrow(
            DomainNotFoundError,
        );
        await expect(useCase.execute('breeder-1', 'nonexistent-pet', mockUpdateData as any)).rejects.toThrow(
            '해당 부모견/부모묘를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.updateParentPet).not.toHaveBeenCalled();
    });
});
