import { BadRequestException } from '@nestjs/common';

import { UpdateBreederPetPostingUseCase } from '../../../application/use-cases/update-breeder-pet-posting.use-case';
import type { BreederPetPostingUpdateCommand } from '../../../application/types/breeder-pet-posting-command.type';

describe('UpdateBreederPetPostingUseCase', () => {
    const profilePort = { findById: jest.fn() };
    const writerPort = { updateByOwner: jest.fn() };

    const useCase = new UpdateBreederPetPostingUseCase(profilePort as any, writerPort as any);

    /** 마지막 updateByOwner 호출에 실린 patch */
    const lastPatch = () => writerPort.updateByOwner.mock.calls.at(-1)![2];

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue({ breederId: 'breeder-1', petType: 'cat' });
        writerPort.updateByOwner.mockResolvedValue({ changed: true });
    });

    it('브리더가 존재하지 않으면 BadRequest', async () => {
        profilePort.findById.mockResolvedValueOnce(null);

        await expect(useCase.execute('user-1', 'pet-1', { price: 100 })).rejects.toThrow(BadRequestException);
        expect(writerPort.updateByOwner).not.toHaveBeenCalled();
    });

    it('본인 글이 아니면 BadRequest', async () => {
        writerPort.updateByOwner.mockResolvedValueOnce({ changed: false });

        await expect(useCase.execute('user-1', 'pet-1', { price: 100 })).rejects.toThrow(BadRequestException);
    });

    it('수정 시 petType 을 브리더 계정 축종으로 재확정한다', async () => {
        // 마이그레이션 전 petType 이 비어 있던 글도 브리더가 수정하면 스스로 복구된다
        await useCase.execute('user-1', 'pet-1', { price: 100 });

        expect(writerPort.updateByOwner).toHaveBeenCalledWith('pet-1', 'breeder-1', { price: 100, petType: 'cat' });
    });

    it('클라이언트가 보낸 petType 은 무시한다', async () => {
        await useCase.execute('user-1', 'pet-1', {
            price: 100,
            petType: 'dog',
        } as BreederPetPostingUpdateCommand);

        expect(lastPatch().petType).toBe('cat');
    });

    it('빈 patch 는 소유 확인만 하도록 petType 도 싣지 않는다', async () => {
        await useCase.execute('user-1', 'pet-1', {});

        expect(lastPatch()).toEqual({});
    });

    it('브리더 축종을 알 수 없으면 petType 을 건드리지 않는다', async () => {
        profilePort.findById.mockResolvedValueOnce({ breederId: 'breeder-1' });

        await useCase.execute('user-1', 'pet-1', { price: 100 });

        expect(lastPatch()).toEqual({ price: 100 });
    });
});
