import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function parseIntegerWithFallback(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export class BreederPetsQueryRequestDto {
    @IsOptional()
    @IsString()
    status?: string;

    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 20))
    @IsOptional()
    limit: number = 20;
}

export class BreederParentPetsQueryRequestDto {
    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 20))
    @IsOptional()
    limit: number = 20;
}
