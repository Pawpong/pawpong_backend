import { BadRequestException } from '@nestjs/common';

import { GetBreederParentPetsUseCase } from '../../../application/use-cases/get-breeder-parent-pets.use-case';
import { BreederPublicParentPetListAssemblerService } from '../../../domain/services/breeder-public-parent-pet-list-assembler.service';

describe('브리더 부모견/부모묘 목록 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
        findActiveParentPetsByBreederId: jest.fn(),
    };
    const breederFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/img.jpg'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetBreederParentPetsUseCase(
        breederPublicReaderPort as any,
        breederFileUrlPort as any,
        new BreederPublicParentPetListAssemblerService(),
    );

    const mockBreeder = { _id: 'breeder-1', accountStatus: 'active' };
    const mockParentPet = {
        _id: { toString: () => 'parent-1' },
        name: '행복이엄마',
        breed: '말티즈',
        gender: 'female',
        birthDate: '2021-01-01',
        photoFileName: null,
        photos: [],
        healthRecords: [],
        description: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/img.jpg');
        breederFileUrlPort.generateOneSafe.mockReturnValue(null);
        breederFileUrlPort.generateMany.mockReturnValue([]);
    });

    it('정상적으로 부모견 목록을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveParentPetsByBreederId.mockResolvedValue([mockParentPet]);

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(1);
        expect(result.items[0].petId).toBe('parent-1');
    });

    it('부모견이 없으면 빈 배열을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findActiveParentPetsByBreederId.mockResolvedValue([]);

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(0);
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
