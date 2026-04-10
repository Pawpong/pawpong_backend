import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

function toNumberWithDefault(defaultValue: number) {
    return Transform(({ value }) => (value === undefined ? defaultValue : Number(value)));
}

export class FeedPopularLimitQueryDto {
    @Allow()
    @toNumberWithDefault(10)
    limit: number = 10;
}

export class FeedPopularTagLimitQueryDto {
    @Allow()
    @toNumberWithDefault(20)
    limit: number = 20;
}

export class FeedSuggestTagQueryDto {
    @Allow()
    q: string;

    @Allow()
    @toNumberWithDefault(10)
    limit: number = 10;
}
