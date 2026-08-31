import { ProfileFollowRepository } from '../../repository/profile-follow.repository';

/**
 * 팔로우 카운터는 입양자·브리더 두 컬렉션에 동시에 시도된다 (_id 가 겹치지 않아 한쪽만 매칭).
 * 브리더는 stats 하위 필드라 경로가 달라, 여기서 어긋나면 카운트가 조용히 유실된다.
 */
describe('ProfileFollowRepository — 팔로우 카운터', () => {
    const followModel = { create: jest.fn(), deleteOne: jest.fn() };
    const adopterModel = { updateOne: jest.fn() };
    const breederModel = { updateOne: jest.fn() };
    const repository = new ProfileFollowRepository(followModel as any, adopterModel as any, breederModel as any);

    const exec = () => ({ exec: jest.fn().mockResolvedValue({}) });
    const incOf = (model: { updateOne: jest.Mock }, callIndex: number) => model.updateOne.mock.calls[callIndex][1].$inc;
    const filterOf = (model: { updateOne: jest.Mock }, callIndex: number) => model.updateOne.mock.calls[callIndex][0];

    beforeEach(() => {
        jest.clearAllMocks();
        adopterModel.updateOne.mockImplementation(exec);
        breederModel.updateOne.mockImplementation(exec);
    });

    it('팔로우 시 양쪽 컬렉션에 followerCount/followingCount 증가를 시도한다', async () => {
        followModel.create.mockResolvedValue({});

        await repository.follow('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');

        expect(adopterModel.updateOne).toHaveBeenCalledTimes(2);
        expect(breederModel.updateOne).toHaveBeenCalledTimes(2);
        expect(incOf(adopterModel, 0)).toEqual({ followerCount: 1 });
        expect(incOf(breederModel, 0)).toEqual({ 'stats.followerCount': 1 });
        expect(incOf(adopterModel, 1)).toEqual({ followingCount: 1 });
        expect(incOf(breederModel, 1)).toEqual({ 'stats.followingCount': 1 });
    });

    it('언팔로우 시 0 미만으로 내려가지 않도록 $gt 조건과 함께 감소한다', async () => {
        followModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

        await repository.unfollow('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');

        expect(incOf(adopterModel, 0)).toEqual({ followerCount: -1 });
        expect(filterOf(adopterModel, 0).followerCount).toEqual({ $gt: 0 });
        expect(incOf(breederModel, 0)).toEqual({ 'stats.followerCount': -1 });
        expect(filterOf(breederModel, 0)['stats.followerCount']).toEqual({ $gt: 0 });
    });

    it('팔로우 관계가 없으면 카운터를 건드리지 않는다 (멱등)', async () => {
        followModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });

        await expect(repository.unfollow('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012')).resolves.toEqual({
            wasFollowing: false,
        });
        expect(adopterModel.updateOne).not.toHaveBeenCalled();
        expect(breederModel.updateOne).not.toHaveBeenCalled();
    });
});
