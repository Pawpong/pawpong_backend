import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function parseIntegerWithFallback(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed === 0 ? fallback : parsed;
}

function parseBooleanQuery(value: unknown): boolean {
    return value === 'true' || value === true;
}

export class MyPetsQueryRequestDto {
    @IsOptional()
    @IsString()
    status?: string;

    @Transform(({ value }) => parseBooleanQuery(value))
    @IsOptional()
    includeInactive: boolean = false;

    @Transform(({ value }) => parseIntegerWithFallback(value, 1))
    @IsOptional()
    page: number = 1;

    @Transform(({ value }) => parseIntegerWithFallback(value, 20))
    @IsOptional()
    limit: number = 20;
}
