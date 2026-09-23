import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DEEP_LINK_ADMIN_STORE_PORT, type DeepLinkAdminStorePort } from '../ports/deep-link-admin-store.port';
import type { CreateDeepLinkCommand } from '../../../../service/deep-link/application/types/deep-link.type';
import { validateDeepLinkValues } from '../../../../service/deep-link/domain/services/deep-link-policy';

@Injectable()
export class CreateDeepLinkUseCase {
    constructor(@Inject(DEEP_LINK_ADMIN_STORE_PORT) private readonly store: DeepLinkAdminStorePort) {}
    /** 관리자가 입력하지 않은 슬러그는 예측하기 어려운 고유 문자열로 생성한다. */
    async execute(command: CreateDeepLinkCommand) {
        const values = {
            slug: command.slug ?? randomBytes(12).toString('hex'),
            title: command.title.trim(),
            description: command.description ?? '',
            targetPath: command.targetPath,
            imageUrl: command.imageUrl ?? '',
            isActive: command.isActive ?? true,
        };
        validateDeepLinkValues(values);
        return this.store.create(values);
    }
}
