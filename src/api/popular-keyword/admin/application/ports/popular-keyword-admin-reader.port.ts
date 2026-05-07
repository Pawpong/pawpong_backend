import type { PopularKeywordSnapshot } from '../../../application/ports/popular-keyword-reader.port';

export const POPULAR_KEYWORD_ADMIN_READER_PORT = Symbol('POPULAR_KEYWORD_ADMIN_READER_PORT');

export interface PopularKeywordAdminReaderPort {
    readAll(): Promise<PopularKeywordSnapshot[]>;
    readById(id: string): Promise<PopularKeywordSnapshot | null>;
    findByKeyword(keyword: string): Promise<PopularKeywordSnapshot | null>;
}
