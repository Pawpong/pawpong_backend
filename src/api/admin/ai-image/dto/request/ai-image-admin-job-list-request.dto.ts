import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { PaginationRequestDto } from '../../../../../common/dto/pagination/pagination-request.dto';
import { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';

/** 어드민 생성 작업 목록 조회 조건 */
export class AiImageAdminJobListRequestDto extends PaginationRequestDto {
    @ApiPropertyOptional({
        description: '작업 상태 필터 (미지정 시 전체)',
        enum: AiImageJobStatus,
        example: AiImageJobStatus.FAILED,
    })
    @IsOptional()
    @IsEnum(AiImageJobStatus)
    status?: AiImageJobStatus;

    @ApiPropertyOptional({ description: '요청 사용자 ID 필터', example: '507f1f77bcf86cd799439011' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ description: 'AI 필터 ID 필터', example: '507f1f77bcf86cd799439011' })
    @IsOptional()
    @IsMongoId()
    filterId?: string;
}
