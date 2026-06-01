import { ApiProperty } from '@nestjs/swagger';

export class CommunityPostReportResponseDto {
    @ApiProperty({ description: '게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '신고 접수 여부 (중복 신고 시 false)', example: true })
    reported: boolean;
}
