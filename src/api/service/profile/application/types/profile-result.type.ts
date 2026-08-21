/**
 * application/domain 계층 내부 결과 타입.
 * 컨트롤러 경계 밖으로 나가지 않으며 @ApiProperty 데코레이터에 의존하지 않는다.
 */

interface BusinessLocationResult {
    city: string;
    district: string;
    address?: string;
}

export interface MyProfileResult {
    role: 'adopter' | 'breeder';
    userId: string;
    nickname: string;
    profileImageUrl?: string;
    bio: string;
    bpm: number;
    followerCount: number;
    followingCount: number;
    // adopter only
    favoriteBreederCount?: number;
    // breeder only
    level?: 'new' | 'elite';
    plan?: 'basic' | 'pro';
    businessLocation?: BusinessLocationResult;
    longDescription?: string;
}

export interface AdopterPublicProfileResult {
    userId: string;
    nickname: string;
    profileImageUrl?: string;
    bio: string;
    bpm: number;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
}

export interface BreederPublicProfileResult {
    breederId: string;
    nickname: string;
    profileImageUrl?: string;
    bio: string;
    longDescription: string;
    bpm: number;
    followerCount: number;
    followingCount: number;
    level: 'new' | 'elite';
    plan: 'basic' | 'pro';
    businessLocation: BusinessLocationResult;
    isFavorited: boolean;
    isFollowing: boolean;
}

export interface FavoriteBreederCardResult {
    breederId: string;
    nickname: string;
    profileImageUrl?: string;
    breederLocation: string;
    recentPetStatus?: 'available' | 'reserved' | 'adopted';
    bpm: number;
    level?: 'new' | 'elite';
    addedAt: string;
    /** 이 엔드포인트는 즐겨찾기한 브리더만 반환하므로 항상 true (카드 별 상태용 계약) */
    isFavorited: true;
}

/** 친구 목록 모달 카드 (응답 계약) */
export interface FollowUserCardResult {
    userId: string;
    nickname: string;
    profileImageUrl?: string;
    bio: string;
    isFollowing: boolean;
    isFollowedBy: boolean;
    followedAt: string;
}
