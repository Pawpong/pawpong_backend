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
