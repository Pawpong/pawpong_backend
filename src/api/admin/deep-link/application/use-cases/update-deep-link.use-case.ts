import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { DEEP_LINK_ADMIN_STORE_PORT, type DeepLinkAdminStorePort } from '../ports/deep-link-admin-store.port';
import type { UpdateDeepLinkCommand } from '../../../../service/deep-link/application/types/deep-link.type';
import { validateDeepLinkValues } from '../../../../service/deep-link/domain/services/deep-link-policy';

@Injectable()
export class UpdateDeepLinkUseCase {
    constructor(@Inject(DEEP_LINK_ADMIN_STORE_PORT) private readonly store: DeepLinkAdminStorePort) {}
    /** 부분 수정도 기존 값과 합친 완성된 링크를 검증한다. */
    async execute(id: string, command: UpdateDeepLinkCommand) {
        const current = await this.store.findById(id);
        if (!current) throw new DomainNotFoundError('링크를 찾을 수 없습니다.');
        const values = {
            slug: command.slug ?? current.slug,
            title: command.title?.trim() ?? current.title,
            description: command.description ?? current.description,
            targetPath: command.targetPath ?? current.targetPath,
            imageUrl: command.imageUrl ?? current.imageUrl,
            isActive: command.isActive ?? current.isActive,
        };
        validateDeepLinkValues(values);
        const updated = await this.store.update(id, values);
        if (!updated) throw new DomainNotFoundError('링크를 찾을 수 없습니다.');
        return updated;
    }
}
