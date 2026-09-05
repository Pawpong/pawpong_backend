/**
 * v2 profile 도메인 — application 계층 내부 타입.
 * port -> domain mapper -> response DTO 사이의 중간 모델.
 */

export interface ProfileBusinessLocation {
    city: string;
    district: string;
    address?: string;
}

export interface AdopterProfileSnapshot {
    userId: string;
    nickname: string;
    profileImageFileName?: string;
    bio: string;
    bpm: number;
    followerCount: number;
    followingCount: number;
    favoriteBreederCount: number;
}

export interface BreederProfileSnapshot {
    /** 공개 프로필 차단용 내부 필드. 응답 DTO에는 포함하지 않는다. */
    isTestAccount?: boolean;
    breederId: string;
    nickname: string;
    profileImageFileName?: string;
    bio: string;
    longDescription: string;
    bpm: number;
    /** 이 브리더를 팔로우한 수 = stats.followerCount. 즐겨찾기(stats.totalFavorites)와는 별개 관계다 */
    followerCount: number;
    /** 이 브리더가 팔로우 중인 수 = stats.followingCount. 브리더도 팔로우 주체가 될 수 있어 0 이 아닐 수 있다 */
    followingCount: number;
    plan: 'basic' | 'pro';
    businessLocation: ProfileBusinessLocation;
}

export interface FavoriteBreederCardSnapshot {
    breederId: string;
    nickname: string;
    profileImageFileName?: string;
    breederLocation: string;
    /** 가장 최근 활성 분양 펫의 status. 분양 진행중 / 분양 완료 / 없음 */
    recentPetStatus?: 'available' | 'reserved' | 'adopted';
    bpm: number;
    addedAt: Date;
}

/**
 * 친구 목록 모달(팔로워/팔로잉 탭)의 사용자 카드.
 * 팔로우 관계의 상대방 사용자 정보 + 조회자(viewer) 기준 관계 플래그.
 */
export interface FollowUserCardSnapshot {
    userId: string;
    nickname: string;
    profileImageFileName?: string;
    bio: string;
    /** 조회자가 이 사용자를 팔로우 중인지 (비로그인 시 false) */
    isFollowing: boolean;
    /** 이 사용자가 조회자를 팔로우 중인지 (양쪽 true 면 맞팔로잉) */
    isFollowedBy: boolean;
    /** 팔로우 관계가 생성된 시각 */
    followedAt: Date;
}
