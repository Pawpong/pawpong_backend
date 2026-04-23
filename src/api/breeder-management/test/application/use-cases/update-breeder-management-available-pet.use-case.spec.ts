import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { UpdateBreederManagementAvailablePetUseCase } from '../../../application/use-cases/update-breeder-management-available-pet.use-case';
import { BreederManagementAvailablePetCommandMapperService } from '../../../domain/services/breeder-management-available-pet-command-mapper.service';
import { BreederManagementAvailablePetCommandResultMapperService } from '../../../domain/services/breeder-management-available-pet-command-result-mapper.service';

describe('브리더 분양 개체 수정 유스케이스', () => {
    const breederManagementPetCommandPort = {
        findAvailablePetByIdAndBreeder: jest.fn(),
        updateAvailablePet: jest.fn(),
    };

    const useCase = new UpdateBreederManagementAvailablePetUseCase(
        breederManagementPetCommandPort as any,
        new BreederManagementAvailablePetCommandMapperService(),
        new BreederManagementAvailablePetCommandResultMapperService(),
    );

    const mockAvailablePet = { _id: 'pet-2', name: '뭉치', breederId: 'breeder-1' };
    const mockUpdateData = { name: '뭉치2', price: 2000000 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 분양 개체 정보를 수정한다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(mockAvailablePet);
        breederManagementPetCommandPort.updateAvailablePet.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'pet-2', mockUpdateData as any);

        expect(result.message).toBeDefined();
        expect(breederManagementPetCommandPort.findAvailablePetByIdAndBreeder).toHaveBeenCalledWith(
            'pet-2',
            'breeder-1',
        );
        expect(breederManagementPetCommandPort.updateAvailablePet).toHaveBeenCalledWith('pet-2', expect.any(Object));
    });

    it('해당 분양 개체를 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet', mockUpdateData as any)).rejects.toThrow(
            DomainNotFoundError,
        );
        await expect(useCase.execute('breeder-1', 'nonexistent-pet', mockUpdateData as any)).rejects.toThrow(
            '해당 분양 개체를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.updateAvailablePet).not.toHaveBeenCalled();
    });
});
