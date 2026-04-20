import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function parseIntegerWithFallback(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export class MyReviewsQueryRequestDto {
    @IsOptional()
    @IsString()
    visibility?: string;

    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 10))
    @IsOptional()
    limit: number = 10;
}
