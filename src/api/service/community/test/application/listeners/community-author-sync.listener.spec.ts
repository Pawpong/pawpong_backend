import { CommunityAuthorSyncListener } from '../../../application/listeners/community-author-sync.listener';
import { USER_PROFILE_UPDATED_EVENT } from '../../../../../../common/events/user-profile-updated.event';

describe('CommunityAuthorSyncListener', () => {
    const makeListener = () => {
        const authorSnapshotPort = {
            syncAuthorSnapshots: jest.fn().mockResolvedValue({ postsModified: 2, commentsModified: 3 }),
        };
        const logger = { logSuccess: jest.fn(), logError: jest.fn() };
        const listener = new CommunityAuthorSyncListener(authorSnapshotPort as any, logger as any);
        return { listener, authorSnapshotPort, logger };
    };

    it('이벤트명이 user.profile.updated 로 고정돼 있다', () => {
        expect(USER_PROFILE_UPDATED_EVENT).toBe('user.profile.updated');
    });

    it('닉네임/이미지 변경을 작성자 snapshot 동기화 포트로 전달한다', async () => {
        const { listener, authorSnapshotPort } = makeListener();

        await listener.handleUserProfileUpdated({
            userId: 'u-1',
            nickname: '장원영',
            profileImageFileName: 'p.jpg',
        });

        expect(authorSnapshotPort.syncAuthorSnapshots).toHaveBeenCalledWith('u-1', {
            nickname: '장원영',
            profileImageFileName: 'p.jpg',
        });
    });

    it('변경 필드가 없으면 포트를 호출하지 않는다', async () => {
        const { listener, authorSnapshotPort } = makeListener();

        await listener.handleUserProfileUpdated({ userId: 'u-1' });

        expect(authorSnapshotPort.syncAuthorSnapshots).not.toHaveBeenCalled();
    });

    it('동기화 실패는 흡수하고 예외를 전파하지 않는다', async () => {
        const { listener, authorSnapshotPort, logger } = makeListener();
        authorSnapshotPort.syncAuthorSnapshots.mockRejectedValueOnce(new Error('db down'));

        await expect(listener.handleUserProfileUpdated({ userId: 'u-1', nickname: '장원영' })).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });
});
