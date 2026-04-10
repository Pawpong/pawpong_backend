import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

function toNumberWithDefault(defaultValue: number) {
    return Transform(({ value }) => (value === undefined ? defaultValue : Number(value)));
}

export class FeedPaginationQueryDto {
    @Allow()
    @toNumberWithDefault(1)
    page: number = 1;

    @Allow()
    @toNumberWithDefault(20)
    limit: number = 20;
}
