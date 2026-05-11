import { BadRequestException, ConflictException } from '@nestjs/common';

import { CreateAdoptionApplicationV2UseCase } from '../../../application/use-cases/create-adoption-application-v2.use-case';
import { AdoptionApplicationPersistMapperService } from '../../../domain/services/adoption-application-persist-mapper.service';
import { AdoptionApplicationValidatorService } from '../../../domain/services/adoption-application-validator.service';

const validCommand = () => ({
    adopterId: 'a-1',
    petId: 'p-1',
    adoptionPlan: '계획',
    familyMembers: '본인',
    privacyConsent: true,
    basicCareConsent: true,
    emergencyCareConsent: true,
    allFamilyConsent: true,
});

describe('CreateAdoptionApplicationV2UseCase', () => {
    const contextPort = { readContext: jest.fn() };
    const writerPort = { existsOpenApplicationForPet: jest.fn(), create: jest.fn() };

    const useCase = new CreateAdoptionApplicationV2UseCase(
        contextPort as any,
        writerPort as any,
        new AdoptionApplicationValidatorService(),
        new AdoptionApplicationPersistMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        contextPort.readContext.mockResolvedValue({
            breederId: 'b-1',
            petName: '레오',
            adopterName: '홍',
        });
        writerPort.existsOpenApplicationForPet.mockResolvedValue(false);
        writerPort.create.mockResolvedValue({ applicationId: 'app-1' });
    });

    it('검증 실패면 context 조회조차 안 일어난다', async () => {
        await expect(useCase.execute({ ...validCommand(), privacyConsent: false })).rejects.toThrow(
            BadRequestException,
        );
        expect(contextPort.readContext).not.toHaveBeenCalled();
        expect(writerPort.create).not.toHaveBeenCalled();
    });

    it('펫 없으면 BadRequest, 중복 체크/생성 안 일어남', async () => {
        contextPort.readContext.mockResolvedValueOnce(null);
        await expect(useCase.execute(validCommand())).rejects.toThrow(BadRequestException);
        expect(writerPort.existsOpenApplicationForPet).not.toHaveBeenCalled();
        expect(writerPort.create).not.toHaveBeenCalled();
    });

    it('처리 중 신청 이미 있으면 Conflict, 생성 안 일어남', async () => {
        writerPort.existsOpenApplicationForPet.mockResolvedValueOnce(true);
        await expect(useCase.execute(validCommand())).rejects.toThrow(ConflictException);
        expect(writerPort.create).not.toHaveBeenCalled();
    });

    it('정상 흐름 — context.breederId 가 persist data 에 들어가고 status=consultation_pending', async () => {
        const result = await useCase.execute(validCommand());
        expect(contextPort.readContext).toHaveBeenCalledWith('p-1', 'a-1');
        expect(writerPort.create).toHaveBeenCalledTimes(1);
        const persistData = writerPort.create.mock.calls[0][0];
        expect(persistData.breederId).toBe('b-1');
        expect(persistData.adopterId).toBe('a-1');
        expect(persistData.petId).toBe('p-1');
        expect(persistData.status).toBe('consultation_pending');
        expect(persistData.standardResponses.canProvideBasicCare).toBe(true);
        expect(result).toEqual({ applicationId: 'app-1', status: 'consultation_pending' });
    });
});
