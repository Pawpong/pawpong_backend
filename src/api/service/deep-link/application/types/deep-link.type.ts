/** 공개 페이지와 앱이 공유하는 링크 계약. 내부 식별자/상태는 공개하지 않는다. */
export interface PublicDeepLink {
    slug: string;
    title: string;
    description: string;
    targetPath: string;
    imageUrl: string;
}

export interface DeepLinkRecord extends PublicDeepLink {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateDeepLinkCommand {
    slug?: string;
    title: string;
    description?: string;
    targetPath: string;
    imageUrl?: string;
    isActive?: boolean;
}

export type UpdateDeepLinkCommand = Partial<CreateDeepLinkCommand>;
export type DeepLinkValues = PublicDeepLink & { isActive: boolean };
