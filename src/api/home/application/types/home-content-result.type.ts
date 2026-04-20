export type HomeBannerResult = {
    bannerId: string;
    desktopImageUrl: string;
    mobileImageUrl: string;
    desktopImageFileName: string;
    mobileImageFileName: string;
    linkType: string;
    linkUrl: string;
    title?: string;
    description?: string;
    order: number;
    isActive: boolean;
    targetAudience?: string[];
};

export type HomeFaqResult = {
    faqId: string;
    question: string;
    answer: string;
    category: string;
    userType: string;
    order: number;
};

export type HomeAvailablePetResult = {
    petId: string;
    name: string;
    breed: string;
    breederId: string;
    breederName: string;
    price: number | null;
    mainPhoto: string;
    birthDate: string | null;
    ageInMonths: number;
    location: {
        city: string;
        district: string;
    };
};
