export type ProfileUpdatableRole = 'adopter' | 'breeder';

/**
 * 사업장 위치 — Breeder 전용 (Figma 290:668 마이홈 "사업장 위치를 작성해주세요" CTA).
 * Adopter 가 location 을 보내면 use-case 가 400 으로 거부한다 (Adopter 스키마에 해당 필드 없음).
 *
 * 각 부분 필드:
 * - city / district: 시·구 (각 ≤ 50자)
 * - address: 상세 주소 (≤ 200자) — 입력은 받지만 공개 응답에는 PII 라 노출하지 않는다 (브리더 본인 응답에는 노출 가능).
 *
 * 빈 문자열 ("") 은 명시적으로 비우는 의도 — null/undefined 와 의미 다름.
 */
export type UpdateMyProfileLocation = {
    city?: string;
    district?: string;
    address?: string;
};

export type UpdateMyProfileCommand = {
    /**
     * 한 줄 소개. trim 결과 길이가 0~200 이어야 한다.
     * 빈 문자열 ("") 은 명시적으로 한 줄 소개를 비우는 의도 — null/undefined 와 의미 다름.
     */
    bio?: string;

    /**
     * 사업장 위치 — Breeder 만 지원. Adopter 가 보내면 거부된다.
     */
    location?: UpdateMyProfileLocation;
};

export const PROFILE_WRITER_PORT = Symbol('PROFILE_WRITER_PORT');

export interface ProfileWriterPort {
    /**
     * 마이홈 프로필 편집. role 에 따라 Adopter/Breeder 도큐먼트에 적용.
     * 사용자/도큐먼트가 없으면 false. 변경 없으면 true 반환 (idempotent).
     */
    updateMyProfile(userId: string, role: ProfileUpdatableRole, command: UpdateMyProfileCommand): Promise<boolean>;
}
