import { Allow } from 'class-validator';

import { FeedPaginationQueryDto } from './feed-pagination-query.dto';

export class FeedTagSearchQueryDto extends FeedPaginationQueryDto {
    @Allow()
    tag: string;
}
