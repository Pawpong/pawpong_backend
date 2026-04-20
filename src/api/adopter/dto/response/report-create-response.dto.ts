import { ApiProperty } from '@nestjs/swagger';

/**
 * 신고 제출 응답 DTO
 * 현재 API가 실제로 반환하는 데이터 구조를 기준으로 유지한다.
 */
export class ReportCreateResponseDto {
    @ApiProperty({
        description: '생성된 신고 ID',
        example: '507f1f77bcf86cd799439055',
    })
    reportId: string;

    @ApiProperty({
        description: '신고 접수 확인 메시지',
        example: '신고가 성공적으로 접수되었습니다. 관리자 검토 후 처리됩니다.',
    })
    message: string;
}
