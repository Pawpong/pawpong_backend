import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunityReportAdminItemResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    reportId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439022' })
    postId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439033' })
    reporterId: string;

    @ApiProperty({ example: '신고자닉네임' })
    reporterNickname: string;

    @ApiProperty({ enum: ['spam', 'inappropriate_content', 'false_info', 'hateful_content', 'other'], example: 'spam' })
    reason: string;

    @ApiPropertyOptional({ example: '스팸입니다.' })
    description?: string;

    @ApiProperty({ enum: ['pending', 'resolved', 'dismissed'], example: 'pending' })
    status: string;

    @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
    createdAt: string;
}

export class CommunityReportAdminActionResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    reportId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439022' })
    postId: string;

    @ApiProperty({ enum: ['resolve', 'dismiss'], example: 'resolve' })
    action: string;
}
