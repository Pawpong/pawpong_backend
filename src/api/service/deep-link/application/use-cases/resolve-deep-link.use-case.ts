import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { DEEP_LINK_READER_PORT, type DeepLinkReaderPort } from '../ports/deep-link-reader.port';
import { DEEP_LINK_SLUG_PATTERN } from '../../domain/services/deep-link-policy';

@Injectable()
export class ResolveDeepLinkUseCase {
    constructor(@Inject(DEEP_LINK_READER_PORT) private readonly reader: DeepLinkReaderPort) {}
    /** 비활성/누락/잘못된 슬러그는 동일하게 404로 처리한다. */
    async execute(slug: string) {
        const result =
            slug.length <= 80 && DEEP_LINK_SLUG_PATTERN.test(slug) ? await this.reader.findActiveBySlug(slug) : null;
        if (!result) throw new DomainNotFoundError('링크를 찾을 수 없습니다.');
        return result;
    }
}
