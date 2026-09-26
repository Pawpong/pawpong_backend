import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { runWithAppRequest } from '../../../../../common/content-rights/app-request-context';
import type { CommunityPostDocument } from '../../../../../schema/community-post.schema';
import type { CommunityPostCommentDocument } from '../../../../../schema/community-post-comment.schema';
import { CommunityRepository } from '../../repository/community.repository';

describe('iOS 앱 커뮤니티 공개 조회', () => {
    const allowedId = new Types.ObjectId();
    const blockedId = new Types.ObjectId();
    const listChain = {
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]),
    };
    const detailChain = { lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(null) };
    const countChain = { exec: jest.fn().mockResolvedValue(0) };
    const find = jest.fn().mockReturnValue(listChain);
    const findOne = jest.fn().mockReturnValue(detailChain);
    const countDocuments = jest.fn().mockReturnValue(countChain);
    const connection = { db: { collection: (name: string) => ({ distinct: () => Promise.resolve(name === 'adopters' ? [allowedId] : []) }) } };
    const postModel = { db: connection, find, findOne, countDocuments } as unknown as Model<CommunityPostDocument>;
    const repository = new CommunityRepository(postModel, {} as Model<CommunityPostCommentDocument>);

    beforeEach(() => { find.mockClear(); findOne.mockClear(); countDocuments.mockClear(); });

    it('앱 목록에서 authorId 파라미터가 동의 작성자 조건을 덮어쓸 수 없다', async () => {
        await runWithAppRequest('Mozilla/5.0 PawpongApp/iOS', async () => {
            await repository.listPosts({ authorId: String(blockedId), sort: 'latest', skip: 0, limit: 10 });
        });
        const filter = find.mock.calls[0][0];
        expect(filter.authorId).toEqual(blockedId);
        expect(filter.$and).toEqual([{ authorId: { $in: [allowedId] } }]);
        expect(countDocuments).toHaveBeenCalledWith(filter);
    });

    it('앱 상세 링크도 동의 작성자 조건으로 조회한다', async () => {
        await runWithAppRequest('Mozilla/5.0 PawpongApp/iOS', async () => {
            await repository.findPostById(String(blockedId));
        });
        expect(findOne.mock.calls[0][0]).toEqual({
            _id: blockedId,
            isActive: true,
            authorId: { $in: [allowedId] },
        });
    });
});
