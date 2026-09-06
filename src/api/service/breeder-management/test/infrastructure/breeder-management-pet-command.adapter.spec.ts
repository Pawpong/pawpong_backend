import { Types } from 'mongoose';

import { PetStatus } from '../../../../../common/enum/user.enum';
import { BreederManagementPetCommandAdapter } from '../../infrastructure/breeder-management-pet-command.adapter';

const breederId = new Types.ObjectId().toString();

const createData = () => ({
    breederId,
    name: '포메라니안 아기',
    breed: '포메라니안',
    gender: 'male',
    birthDate: new Date('2025-01-01'),
    price: 1_500_000,
    status: PetStatus.AVAILABLE,
    photos: ['available-pets/1.jpg'],
    description: '건강합니다',
});

function makeAdapter(breederPetType?: string) {
    const availablePetRepository = { create: jest.fn().mockResolvedValue({ _id: 'pet-1' }) };
    const breederRepository = {
        findById: jest.fn().mockResolvedValue(breederPetType === undefined ? null : { petType: breederPetType }),
    };
    const adapter = new BreederManagementPetCommandAdapter(
        { create: jest.fn() } as any,
        availablePetRepository as any,
        breederRepository as any,
    );

    return { adapter, availablePetRepository, breederRepository };
}

/**
 * 분양 가능 동물 생성 경로의 petType 파생 검증.
 *
 * 탐색 페이지 축종 탭이 available_pets.petType 으로 필터링하므로,
 * 생성 시점에 글쓴 브리더 계정의 축종이 반드시 실려야 한다.
 */
describe('BreederManagementPetCommandAdapter.createAvailablePet', () => {
    it('petType 을 글쓴 브리더 계정에서 채운다', async () => {
        const { adapter, availablePetRepository, breederRepository } = makeAdapter('cat');

        await adapter.createAvailablePet(createData());

        expect(breederRepository.findById).toHaveBeenCalledWith(breederId);
        expect(availablePetRepository.create.mock.calls[0][0].petType).toBe('cat');
    });

    it('reptile 브리더도 그대로 반영한다', async () => {
        const { adapter, availablePetRepository } = makeAdapter('reptile');

        await adapter.createAvailablePet(createData());

        expect(availablePetRepository.create.mock.calls[0][0].petType).toBe('reptile');
    });

    it('브리더를 찾을 수 없으면 임의 기본값 대신 비워 둔다', async () => {
        const { adapter, availablePetRepository } = makeAdapter(undefined);

        await adapter.createAvailablePet(createData());

        expect(availablePetRepository.create.mock.calls[0][0].petType).toBeUndefined();
    });

    it('enum 밖 축종이 저장된 레거시 브리더 문서는 걸러낸다', async () => {
        const { adapter, availablePetRepository } = makeAdapter('bird');

        await adapter.createAvailablePet(createData());

        expect(availablePetRepository.create.mock.calls[0][0].petType).toBeUndefined();
    });
});
