/**
 * 알림 클릭 시 이동할 **프론트엔드 경로**.
 *
 * 호출부가 문자열을 직접 만들면 오타가 나도 아무도 모르고, 사용자는 404 를 본다.
 * 실제로 커뮤니티 좋아요 알림이 API 경로(`/community/posts/{id}`)를 그대로 써서
 * 존재하지 않는 라우트로 보내고 있었다. 링크는 반드시 여기를 거친다.
 *
 * 각 경로는 `pawpong_frontend_2.0/src/app/(main)/` 의 실제 디렉터리와 1:1 로 대응한다.
 * 경로를 추가할 때는 프론트에 그 라우트가 실재하는지 먼저 확인할 것.
 */
export const NOTIFICATION_TARGET_URL = {
    /** 신청 상세 — app/(main)/activity/applications/[applicationId] */
    applicationDetail: (applicationId: string): string => `/activity/applications/${applicationId}`,

    /** 받은 후기 목록 — app/(main)/activity 의 reviews 탭 (ActivityTab: 'reviews') */
    receivedReviews: (): string => '/activity?tab=reviews',

    /** 마이홈 — app/(main)/home */
    myHome: (): string => '/home',

    /** 커뮤니티 글 상세 — app/(main)/community/post/[postId] (복수형 posts 는 라우트가 없다) */
    communityPost: (postId: string): string => `/community/post/${postId}`,
} as const;
