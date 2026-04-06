import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedTagQueryService {
    normalizeTag(tag: string): string {
        return tag.trim().replace(/^#/, '').trim().toLowerCase();
    }
}
