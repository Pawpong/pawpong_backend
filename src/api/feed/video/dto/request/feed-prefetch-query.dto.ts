import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

import { parseIntegerWithFallback, parseNonNegativeInteger } from './feed-query-number.parser';

export class FeedPrefetchQueryDto {
    @Allow()
    @Transform(({ value }) => parseNonNegativeInteger(value, 0))
    segment: number;

    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 5))
    count: number = 5;
}
