export const COMMUNITY_FOLLOW_READER_PORT = Symbol('COMMUNITY_FOLLOW_READER_PORT');

/**
 * 커뮤니티 열람 제한(팔로워공개) 판정을 위한 팔로우 관계 읽기 경계.
 *
 * 팔로우 도메인은 profile 이 소유하지만, 커뮤니티는 자신의 port 로 경계를 선언하고
 * infrastructure adapter 가 공유 스키마(user_follows) 를 캡슐화해 구현한다.
 */
export interface CommunityFollowReaderPort {
    /** followerId 가 팔로우한 작성자 ID 목록. 팔로워공개 글 열람 허용 판정에 사용. */
    listFolloweeIds(followerId: string): Promise<string[]>;

    /** followerId 가 followeeId 를 팔로우 중인지 여부. 상세 열람 판정에 사용. */
    isFollowing(followerId: string, followeeId: string): Promise<boolean>;
}
