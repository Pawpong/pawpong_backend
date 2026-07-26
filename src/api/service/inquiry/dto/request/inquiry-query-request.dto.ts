import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function parseIntegerWithFallback(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed === 0 ? fallback : parsed;
}

function parseAnsweredQuery(value: unknown): boolean {
    return value === 'true' || value === true;
}

export class InquiryListQueryRequestDto {
    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 15))
    @IsOptional()
    limit: number = 15;

    @IsOptional()
    @IsString()
    animalType?: 'dog' | 'cat';

    @Transform(({ value }) => value || 'latest_answer')
    @IsOptional()
    @IsString()
    sort: string = 'latest_answer';
}

export class MyInquiryListQueryRequestDto {
    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 15))
    @IsOptional()
    limit: number = 15;

    @IsOptional()
    @IsString()
    animalType?: 'dog' | 'cat';
}

export class BreederInquiryListQueryRequestDto {
    @Transform(({ value }) => parseAnsweredQuery(value))
    @IsOptional()
    answered: boolean = false;

    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 15))
    @IsOptional()
    limit: number = 15;
}
