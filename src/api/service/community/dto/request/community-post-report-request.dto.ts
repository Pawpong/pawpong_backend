import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import type { CommunityReportReason } from '../../application/types/community-report.type';

export class CommunityPostReportRequestDto {
    @ApiProperty({
        description: '신고 사유',
        enum: ['spam', 'inappropriate_content', 'false_info', 'hateful_content', 'other'],
        example: 'spam',
    })
    @IsEnum(['spam', 'inappropriate_content', 'false_info', 'hateful_content', 'other'])
    reason: CommunityReportReason;

    @ApiPropertyOptional({ description: '상세 내용 (선택)', example: '반복적으로 광고를 올립니다.', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
