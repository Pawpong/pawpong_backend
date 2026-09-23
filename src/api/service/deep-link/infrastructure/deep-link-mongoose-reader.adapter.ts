import { Injectable } from '@nestjs/common';
import type { DeepLinkReaderPort } from '../application/ports/deep-link-reader.port';
import { DeepLinkRepository } from '../repository/deep-link.repository';

@Injectable()
export class DeepLinkMongooseReaderAdapter implements DeepLinkReaderPort {
    constructor(private readonly repository: DeepLinkRepository) {}
    /** 공개 조회를 저장소에 위임한다. */
    findActiveBySlug(slug: string) {
        return this.repository.findActiveBySlug(slug);
    }
}
