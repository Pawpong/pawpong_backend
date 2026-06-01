import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationRequestDto } from '../../../../../common/dto/pagination/pagination-request.dto';
import type { CommunityReportStatus } from '../../../application/types/community-report.type';

export class CommunityReportAdminListQueryDto extends PaginationRequestDto {
    @ApiPropertyOptional({
        description: '신고 처리 상태 필터',
        enum: ['pending', 'resolved', 'dismissed'],
        example: 'pending',
    })
    @IsOptional()
    @IsEnum(['pending', 'resolved', 'dismissed'])
    @Type(() => String)
    status?: CommunityReportStatus;
}
