import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

function toNumberWithDefault(defaultValue: number) {
    return Transform(({ value }) => (value === undefined ? defaultValue : Number(value)));
}

export class FeedPrefetchQueryDto {
    @Allow()
    @Transform(({ value }) => Number(value))
    segment: number;

    @Allow()
    @toNumberWithDefault(5)
    count: number = 5;
}
