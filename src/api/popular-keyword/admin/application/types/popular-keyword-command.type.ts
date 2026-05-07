export type CreatePopularKeywordCommand = {
    keyword: string;
    rank?: number;
    isActive?: boolean;
};

export type UpdatePopularKeywordCommand = {
    keyword?: string;
    rank?: number;
    isActive?: boolean;
};
