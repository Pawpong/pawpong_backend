import { BadRequestException } from '@nestjs/common';

import { SaveBreederPetPostingDraftUseCase } from '../../../application/use-cases/save-breeder-pet-posting-draft.use-case';

describe('SaveBreederPetPostingDraftUseCase', () => {
    const profilePort = { findById: jest.fn() };
    const draftPort = {
        create: jest.fn(),
        updateByOwner: jest.fn(),
        countByOwner: jest.fn(),
    };

    const useCase = new SaveBreederPetPostingDraftUseCase(profilePort as any, draftPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
        profilePort.findById.mockResolvedValue({ breederId: 'breeder-1' });
        draftPort.create.mockResolvedValue({ draftId: 'draft-1' });
        draftPort.updateByOwner.mockResolvedValue({ updated: true });
        draftPort.countByOwner.mockResolvedValue(0);
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — 신규 임시저장은 form 을 그대로 보관하고 draftId 를 반환한다', async () => {
        const form = { name: '레오파드게코', photos: ['p/1.jpg'] };

        const result = await useCase.execute('user-1', null, form);

        expect(draftPort.create).toHaveBeenCalledWith('breeder-1', form);
        expect(result).toEqual({ draftId: 'draft-1' });
    });

    it('정상 — draftId 가 있으면 본인 draft 를 덮어쓴다 (상한 검사 없음)', async () => {
        const form = { name: '수정된 이름' };

        const result = await useCase.execute('user-1', 'draft-1', form);

        expect(draftPort.updateByOwner).toHaveBeenCalledWith('draft-1', 'breeder-1', form);
        expect(draftPort.countByOwner).not.toHaveBeenCalled();
        expect(result).toEqual({ draftId: 'draft-1' });
    });

    it('정상 — 미완성 폼(빈 객체)도 저장을 허용한다', async () => {
        await expect(useCase.execute('user-1', null, {})).resolves.toEqual({ draftId: 'draft-1' });
    });

    // ─── 엣지 케이스 ───────────────────────────────────────────────

    it('엣지 — 브리더 미존재 → BadRequest, 저장 시도 안 함', async () => {
        profilePort.findById.mockResolvedValueOnce(null);

        await expect(useCase.execute('user-1', null, {})).rejects.toThrow(BadRequestException);
        expect(draftPort.create).not.toHaveBeenCalled();
    });

    it('엣지 — 덮어쓰기 대상이 본인 것이 아니거나 미존재 → BadRequest', async () => {
        draftPort.updateByOwner.mockResolvedValueOnce({ updated: false });

        await expect(useCase.execute('user-1', 'other-draft', {})).rejects.toThrow(
            '해당 임시저장 글을 찾을 수 없습니다.',
        );
    });

    it('엣지 — 임시저장 10개 도달 후 신규 저장 → BadRequest', async () => {
        draftPort.countByOwner.mockResolvedValueOnce(10);

        await expect(useCase.execute('user-1', null, {})).rejects.toThrow('최대 10개');
        expect(draftPort.create).not.toHaveBeenCalled();
    });
});
