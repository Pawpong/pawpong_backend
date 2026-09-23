import { Inject, Injectable } from '@nestjs/common';
import { DEEP_LINK_ADMIN_STORE_PORT, type DeepLinkAdminStorePort } from '../ports/deep-link-admin-store.port';
import { buildPageResult, type PageResult } from '../../../../../common/types/page-result.type';
import type { DeepLinkRecord } from '../../../../service/deep-link/application/types/deep-link.type';

@Injectable()
export class ListDeepLinksUseCase {
    constructor(@Inject(DEEP_LINK_ADMIN_STORE_PORT) private readonly store: DeepLinkAdminStorePort) {}
    /** 관리자 목록에 기존 페이지네이션 계약을 적용한다. */
    async execute(query: { page?: number; limit?: number }): Promise<PageResult<DeepLinkRecord>> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const { items, totalItems } = await this.store.list(page, limit);
        return buildPageResult(items, page, limit, totalItems);
    }
}
