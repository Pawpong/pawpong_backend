import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

import { parseIntegerWithFallback } from './feed-query-number.parser';

export class FeedPaginationQueryDto {
    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    page: number = 1;

    @Allow()
    @Transform(({ value }) => parseIntegerWithFallback(value, 20))
    limit: number = 20;
}
