import type { PublicDeepLink } from '../types/deep-link.type';

export const DEEP_LINK_READER_PORT = Symbol('DEEP_LINK_READER_PORT');
export interface DeepLinkReaderPort {
    findActiveBySlug(slug: string): Promise<PublicDeepLink | null>;
}
