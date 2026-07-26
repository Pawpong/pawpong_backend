export interface PopularKeywordSnapshot {
    id: string;
    keyword: string;
    rank: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const POPULAR_KEYWORD_READER_PORT = Symbol('POPULAR_KEYWORD_READER_PORT');

export interface PopularKeywordReaderPort {
    readActiveAll(): Promise<PopularKeywordSnapshot[]>;
}
