import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

import { parseIntegerWithFallback } from './feed-query-number.parser';

export class FeedPopularLimitQueryDto {
    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 10))
    limit: number = 10;
}

export class FeedPopularTagLimitQueryDto {
    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 20))
    limit: number = 20;
}

export class FeedSuggestTagQueryDto {
    @Allow()
    q: string;

    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 10))
    limit: number = 10;
}
