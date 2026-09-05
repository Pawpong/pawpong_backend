import { BadRequestException } from '@nestjs/common';

import { FollowUserUseCase } from '../../../application/use-cases/follow-user.use-case';

describe('FollowUserUseCase', () => {
    const reader = { readAdopter: jest.fn(), readBreeder: jest.fn() };
    const follow = { follow: jest.fn() };
    const useCase = new FollowUserUseCase(reader as any, follow as any);

    beforeEach(() => {
        jest.clearAllMocks();
        follow.follow.mockResolvedValue({ alreadyFollowing: false });
    });

    it('자기 자신 팔로우는 BadRequest', async () => {
        await expect(useCase.execute('u-1', 'u-1')).rejects.toThrow(BadRequestException);
        expect(follow.follow).not.toHaveBeenCalled();
    });

    it('입양자 대상이면 팔로우한다', async () => {
        reader.readAdopter.mockResolvedValue({ userId: 'u-2' });
        await expect(useCase.execute('u-1', 'u-2')).resolves.toEqual({ alreadyFollowing: false });
        expect(reader.readBreeder).not.toHaveBeenCalled();
    });

    it('입양자에 없으면 브리더로 조회해 팔로우한다 (브리더홈 팔로우 버튼)', async () => {
        reader.readAdopter.mockResolvedValue(null);
        reader.readBreeder.mockResolvedValue({ breederId: 'b-1' });
        await expect(useCase.execute('u-1', 'b-1')).resolves.toEqual({ alreadyFollowing: false });
        expect(follow.follow).toHaveBeenCalledWith('u-1', 'b-1');
    });

    it('입양자·브리더 어디에도 없으면 BadRequest', async () => {
        reader.readAdopter.mockResolvedValue(null);
        reader.readBreeder.mockResolvedValue(null);
        await expect(useCase.execute('u-1', 'x')).rejects.toThrow(BadRequestException);
        expect(follow.follow).not.toHaveBeenCalled();
    });
});
