import type { PopularKeywordSnapshot } from '../../../application/ports/popular-keyword-reader.port';
import type { CreatePopularKeywordCommand, UpdatePopularKeywordCommand } from '../types/popular-keyword-command.type';

export const POPULAR_KEYWORD_WRITER_PORT = Symbol('POPULAR_KEYWORD_WRITER_PORT');

export interface PopularKeywordWriterPort {
    create(command: CreatePopularKeywordCommand): Promise<PopularKeywordSnapshot>;
    update(id: string, command: UpdatePopularKeywordCommand): Promise<PopularKeywordSnapshot | null>;
    delete(id: string): Promise<boolean>;
}
