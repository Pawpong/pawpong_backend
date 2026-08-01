import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedTagNormalizerService {
    normalizeTag(tag: string): string {
        return tag.trim().replace(/^#/, '').trim().toLowerCase();
    }
}
