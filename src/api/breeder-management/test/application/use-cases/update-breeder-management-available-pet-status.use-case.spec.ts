import { BadRequestException } from '@nestjs/common';

import { PetStatus } from '../../../../../common/enum/user.enum';
import { UpdateBreederManagementAvailablePetStatusUseCase } from '../../../application/use-cases/update-breeder-management-available-pet-status.use-case';
import { BreederManagementAvailablePetStatusResultMapperService } from '../../../domain/services/breeder-management-available-pet-status-result-mapper.service';

describe('브리더 분양 개체 상태 변경 유스케이스', () => {
    const breederManagementPetCommandPort = {
        findAvailablePetByIdAndBreeder: jest.fn(),
        updateAvailablePetStatus: jest.fn(),
    };

    const useCase = new UpdateBreederManagementAvailablePetStatusUseCase(
        breederManagementPetCommandPort as any,
        new BreederManagementAvailablePetStatusResultMapperService(),
    );

    const mockAvailablePet = { _id: 'pet-2', name: '뭉치', status: PetStatus.AVAILABLE };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 분양 개체 상태를 변경한다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(mockAvailablePet);
        breederManagementPetCommandPort.updateAvailablePetStatus.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'pet-2', PetStatus.RESERVED);

        expect(result.message).toBeDefined();
        expect(breederManagementPetCommandPort.findAvailablePetByIdAndBreeder).toHaveBeenCalledWith('pet-2', 'breeder-1');
        expect(breederManagementPetCommandPort.updateAvailablePetStatus).toHaveBeenCalledWith('pet-2', PetStatus.RESERVED);
    });

    it('해당 분양 개체를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederManagementPetCommandPort.findAvailablePetByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-pet', PetStatus.ADOPTED)).rejects.toThrow(
            BadRequestException,
        );
        await expect(useCase.execute('breeder-1', 'nonexistent-pet', PetStatus.ADOPTED)).rejects.toThrow(
            '해당 분양 개체를 찾을 수 없습니다.',
        );
        expect(breederManagementPetCommandPort.updateAvailablePetStatus).not.toHaveBeenCalled();
    });
});
