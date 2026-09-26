import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDefined,
    IsObject,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

class AdminPushTargetDto {
    @ApiProperty({
        description: '발송 대상 유형',
        enum: ['all_adopters', 'all_breeders', 'individual'],
        example: 'all_adopters',
    })
    @IsEnum(['all_adopters', 'all_breeders', 'individual'])
    type: 'all_adopters' | 'all_breeders' | 'individual';

    @ApiPropertyOptional({
        description: '개별 발송 시 대상 role (type=individual 필수)',
        enum: ['adopter', 'breeder'],
    })
    @IsOptional()
    @IsEnum(['adopter', 'breeder'])
    role?: 'adopter' | 'breeder';

    @ApiPropertyOptional({ description: '개별 발송 시 대상 userId (type=individual 필수)' })
    @IsOptional()
    @IsString()
    userId?: string;
}

export class SendAdminPushRequestDto {
    @ApiProperty({ description: '발송 대상', type: AdminPushTargetDto })
    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => AdminPushTargetDto)
    target: AdminPushTargetDto;

    @ApiProperty({
        description: '발송 목적. 앱 홍보·이벤트 안내는 marketing을 선택하며 수신 동의자에게만 발송됩니다.',
        enum: ['service', 'marketing'],
    })
    @IsEnum(['service', 'marketing'])
    purpose: 'service' | 'marketing';

    @ApiProperty({ description: '제목 (≤100, trim 후 비어있을 수 없음)', example: '추석 연휴 안내' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @ApiProperty({ description: '본문 (≤500, trim 후 비어있을 수 없음)', example: '...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    body: string;

    @ApiPropertyOptional({ description: '클릭 시 이동할 URL (deep link 등)', example: '/notifications' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    targetUrl?: string;
}
