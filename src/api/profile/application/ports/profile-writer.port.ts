export type ProfileUpdatableRole = 'adopter' | 'breeder';

export type UpdateMyProfileCommand = {
    /**
     * 한 줄 소개. trim 결과 길이가 0~200 이어야 한다.
     * 빈 문자열 ("") 은 명시적으로 한 줄 소개를 비우는 의도 — null/undefined 와 의미 다름.
     */
    bio?: string;
};

export const PROFILE_WRITER_PORT = Symbol('PROFILE_WRITER_PORT');

export interface ProfileWriterPort {
    /**
     * 마이홈 프로필 편집. role 에 따라 Adopter/Breeder 도큐먼트에 적용.
     * 사용자/도큐먼트가 없으면 false. 변경 없으면 true 반환 (idempotent).
     */
    updateMyProfile(userId: string, role: ProfileUpdatableRole, command: UpdateMyProfileCommand): Promise<boolean>;
}
