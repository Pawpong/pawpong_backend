import { BadRequestException } from '@nestjs/common';

import { CreateBreederPetPostingUseCase } from '../../../application/use-cases/create-breeder-pet-posting.use-case';
import { BreederPetPostingMapperService } from '../../../domain/services/breeder-pet-posting-mapper.service';
import { BreederPetPostingValidatorService } from '../../../domain/services/breeder-pet-posting-validator.service';
import type { BreederPetPostingCreateCommand } from '../../../application/types/breeder-pet-posting-command.type';

const validCommand = (): BreederPetPostingCreateCommand => ({
    name: '레오파드게코',
    breed: '레오파드게코',
    gender: 'female',
    birthDate: '2024-11-05',
    price: 200000,
    description: '귀여운 파이리',
    photos: ['p/1.jpg'],
    representativePhotoIndex: 0,
    vaccinationStatus: 'completed',
    vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
    geneticTestStatus: 'incomplete',
    geneticTestIncompleteReason: '검사 예정',
});

describe('CreateBreederPetPostingUseCase', () => {
    const profilePort = { findById: jest.fn() };
    const writerPort = { create: jest.fn() };

    const useCase = new CreateBreederPetPostingUseCase(
        profilePort as any,
        writerPort as any,
        new BreederPetPostingValidatorService(),
        new BreederPetPostingMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue({ breederId: 'breeder-1' });
        writerPort.create.mockResolvedValue({ petId: 'pet-1' });
    });

    it('브리더가 존재하지 않으면 BadRequest', async () => {
        profilePort.findById.mockResolvedValueOnce(null);
        await expect(useCase.execute('user-1', validCommand())).rejects.toThrow(BadRequestException);
        expect(writerPort.create).not.toHaveBeenCalled();
    });

    it('검증 실패 시 writer 가 호출되지 않는다', async () => {
        await expect(useCase.execute('user-1', { ...validCommand(), photos: [] })).rejects.toThrow(BadRequestException);
        expect(writerPort.create).not.toHaveBeenCalled();
    });

    it('정상 흐름 — breederId 가 profilePort 결과에서 채워진다', async () => {
        const result = await useCase.execute('user-1', validCommand());

        expect(profilePort.findById).toHaveBeenCalledWith('user-1');
        expect(writerPort.create).toHaveBeenCalledTimes(1);
        const persistData = writerPort.create.mock.calls[0][0];
        expect(persistData.breederId).toBe('breeder-1');
        expect(persistData.status).toBe('available');
        expect(persistData.vaccinationRecords).toHaveLength(1);
        expect(result).toEqual({ petId: 'pet-1' });
    });

    it('vaccination incomplete 흐름에서도 writer 에 incompleteReason 만 전달된다', async () => {
        await useCase.execute('user-1', {
            ...validCommand(),
            vaccinationStatus: 'incomplete',
            vaccinationRecords: undefined,
            vaccinationIncompleteReason: '태어난지 한달도 안됨',
        });

        const persistData = writerPort.create.mock.calls[0][0];
        expect(persistData.vaccinationStatus).toBe('incomplete');
        expect(persistData.vaccinationRecords).toEqual([]);
        expect(persistData.vaccinationIncompleteReason).toBe('태어난지 한달도 안됨');
    });
});
