export interface HomeBannerSnapshot {
    id: string;
    desktopImageFileName?: string;
    mobileImageFileName?: string;
    imageFileName?: string;
    linkType: string;
    linkUrl: string;
    title?: string;
    description?: string;
    order: number;
    isActive: boolean;
    targetAudience?: string[];
}

export interface HomeFaqSnapshot {
    id: string;
    question: string;
    answer: string;
    category: string;
    userType: string;
    order: number;
}

export interface HomeAvailablePetSnapshot {
    id: string;
    name: string;
    breed: string;
    price: number;
    photos: string[];
    birthDate?: Date | string | null;
    breederId: string;
    breederName: string;
    breederCity?: string;
    breederDistrict?: string;
}

export type HomeFaqAudience = 'adopter' | 'breeder';

export const HOME_CONTENT_READER_PORT = Symbol('HOME_CONTENT_READER_PORT');

export interface HomeContentReaderPort {
    readActiveBanners(): Promise<HomeBannerSnapshot[]>;
    readFaqsFor(audience: HomeFaqAudience): Promise<HomeFaqSnapshot[]>;
    readAvailablePets(limit: number): Promise<HomeAvailablePetSnapshot[]>;
}
