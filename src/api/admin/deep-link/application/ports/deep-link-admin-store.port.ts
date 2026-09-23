import type { DeepLinkRecord, DeepLinkValues } from '../../../../service/deep-link/application/types/deep-link.type';

export const DEEP_LINK_ADMIN_STORE_PORT = Symbol('DEEP_LINK_ADMIN_STORE_PORT');
export interface DeepLinkAdminStorePort {
    list(page: number, limit: number): Promise<{ items: DeepLinkRecord[]; totalItems: number }>;
    findById(id: string): Promise<DeepLinkRecord | null>;
    create(values: DeepLinkValues): Promise<DeepLinkRecord>;
    update(id: string, values: DeepLinkValues): Promise<DeepLinkRecord | null>;
    delete(id: string): Promise<boolean>;
}
