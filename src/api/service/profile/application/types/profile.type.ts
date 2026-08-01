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
    breederId: string;
    nickname: string;
    profileImageFileName?: string;
    bio: string;
    longDescription: string;
    bpm: number;
    /** 브리더 followerCount = stats.totalFavorites (즐겨찾기 입양자 수) */
    followerCount: number;
    /** 브리더는 팔로우 주체 카운터를 두지 않으므로 항상 0 (계약 통일용) */
    followingCount: number;
    level: 'new' | 'elite';
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
    level?: 'new' | 'elite';
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
