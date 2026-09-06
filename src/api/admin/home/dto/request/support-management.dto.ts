import { Type } from 'class-transformer';
import { IsUUID, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SupportStatus } from '../../application/ports/support-management.port';
export class SupportListQueryDto {
    @ApiPropertyOptional() @IsOptional() @IsUUID() receiptId?: string;
    @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1;
    @ApiPropertyOptional({ enum: ['open', 'in_progress', 'resolved'] })
    @IsOptional()
    @IsIn(['open', 'in_progress', 'resolved'])
    status?: SupportStatus;
}
export class SupportUpdateDto {
    @ApiProperty() @IsInt() @Min(0) revision: number;
    @ApiProperty({ enum: ['open', 'in_progress', 'resolved'] })
    @IsIn(['open', 'in_progress', 'resolved'])
    status: SupportStatus;
    @ApiPropertyOptional({ enum: ['me', 'unassigned'] }) @IsOptional() @IsIn(['me', 'unassigned']) assignment?:
        | 'me'
        | 'unassigned';
    @ApiPropertyOptional({ maxLength: 1000 }) @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
