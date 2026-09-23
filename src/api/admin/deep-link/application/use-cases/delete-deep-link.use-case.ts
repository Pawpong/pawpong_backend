import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { DEEP_LINK_ADMIN_STORE_PORT, type DeepLinkAdminStorePort } from '../ports/deep-link-admin-store.port';

@Injectable()
export class DeleteDeepLinkUseCase {
    constructor(@Inject(DEEP_LINK_ADMIN_STORE_PORT) private readonly store: DeepLinkAdminStorePort) {}
    /** 없는 링크의 삭제는 관리자에게 명확히 알린다. */
    async execute(id: string): Promise<void> {
        if (!(await this.store.delete(id))) throw new DomainNotFoundError('링크를 찾을 수 없습니다.');
    }
}
