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
    level: 'new' | 'elite';
    plan: 'basic' | 'pro';
    businessLocation: BusinessLocationResult;
    isFavorited: boolean;
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
}
