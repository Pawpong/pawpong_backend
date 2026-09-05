/**
 * 사용자 프로필(표시 정보) 변경 이벤트.
 *
 * 닉네임/프로필 이미지처럼 다른 도메인에 denormalized snapshot 으로 복제된 값이 바뀔 때 발행한다.
 * 예) 커뮤니티 게시글/댓글의 authorNickname·authorProfileImageFileName 스냅샷 동기화.
 *
 * 값이 실제로 변경된 필드만 담는다(undefined 는 "변경 없음"). profileImageFileName 은
 * 빈 문자열/undefined 로 "이미지 제거"를 표현할 수 있으므로 리스너에서 존재 여부로 판단한다.
 */
export const USER_PROFILE_UPDATED_EVENT = 'user.profile.updated';

export interface UserProfileUpdatedEvent {
    /** 대상 사용자 ID (adopter/breeder 공용 — community authorId 와 매칭) */
    userId: string;
    /** 변경된 닉네임 (미변경 시 생략) */
    nickname?: string;
    /** 변경된 프로필 이미지 파일명 (미변경 시 생략) */
    profileImageFileName?: string;
}
