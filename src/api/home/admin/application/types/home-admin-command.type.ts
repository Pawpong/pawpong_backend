export type HomeBannerCommand = {
    desktopImageFileName: string;
    mobileImageFileName: string;
    linkType: string;
    linkUrl: string;
    order?: number;
    isActive?: boolean;
    title?: string;
    description?: string;
    targetAudience?: string[];
};

export type HomeBannerUpdateCommand = Partial<HomeBannerCommand>;

export type HomeFaqCommand = {
    question: string;
    answer: string;
    category: string;
    userType?: string;
    order?: number;
    isActive?: boolean;
};

export type HomeFaqUpdateCommand = Partial<HomeFaqCommand>;
