import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { RemoveBreederManagementAvailablePetUseCase } from '../../../application/use-cases/remove-breeder-management-available-pet.use-case';
import { BreederManagementAvailablePetCommandResultMapperService } from '../../../domain/services/breeder-management-available-pet-command-result-mapper.service';

describe('브리더 분양 개체 삭제 유스케이스', () => {
    const breederManagementPetCommandPort = {
        findAvailablePetByIdAndBreeder: jest.fn(),
        deleteAvailablePet: jest.fn(),
    };

    const useCase = new RemoveBreederManagementAvailablePetUseCase(
        breederManagementPetCommandPort as any,
        new BreederManagementAvailablePetCommandResultMapperService(),
    );

    const mockAvailablePet = { _id: 'pet-2', name: '뭉치', breederId: 'breeder-1' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 분양 개체를 삭제한다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(mockAvailablePet);
        breederManagementPetCommandPort.deleteAvailablePet.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'pet-2');

        expect(result.message).toBeDefined();
        expect(breederManagementPetCommandPort.findAvailablePetByIdAndBreeder).toHaveBeenCalledWith('pet-2', 'breeder-1');
        expect(breederManagementPetCommandPort.deleteAvailablePet).toHaveBeenCalledWith('pet-2');
    });

    it('해당 분양 개체를 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('breeder-1', 'nonexistent-pet')).rejects.toThrow(
            '해당 분양 개체를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.deleteAvailablePet).not.toHaveBeenCalled();
    });
});
