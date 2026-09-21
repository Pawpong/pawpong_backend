import { NOTIFICATION_TARGET_URL } from '../../constants/notification-target-url';

describe('알림 이동 경로', () => {
    it('커뮤니티 글은 단수 post 경로를 쓴다 (posts 는 프론트 라우트가 없어 404)', () => {
        expect(NOTIFICATION_TARGET_URL.communityPost('post-1')).toBe('/community/post/post-1');
        expect(NOTIFICATION_TARGET_URL.communityPost('post-1')).not.toContain('/posts/');
    });

    it('신청 상세는 activity 하위 경로를 쓴다', () => {
        expect(NOTIFICATION_TARGET_URL.applicationDetail('app-1')).toBe('/activity/applications/app-1');
    });

    it('받은 후기는 activity 의 reviews 탭으로 보낸다', () => {
        expect(NOTIFICATION_TARGET_URL.receivedReviews()).toBe('/activity?tab=reviews');
    });

    it('브리더 승인은 마이홈으로 보낸다', () => {
        expect(NOTIFICATION_TARGET_URL.myHome()).toBe('/home');
    });

    it('모든 경로는 프론트가 이동 조건으로 쓰는 / 로 시작한다', () => {
        // NotificationBell 은 targetUrl?.startsWith('/') 일 때만 router.push 한다.
        const urls = [
            NOTIFICATION_TARGET_URL.applicationDetail('a'),
            NOTIFICATION_TARGET_URL.receivedReviews(),
            NOTIFICATION_TARGET_URL.myHome(),
            NOTIFICATION_TARGET_URL.communityPost('p'),
        ];
        for (const url of urls) expect(url.startsWith('/')).toBe(true);
    });
});
