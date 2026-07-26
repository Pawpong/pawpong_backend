import { ApiProperty } from '@nestjs/swagger';

/**
 * 입양 신청 상태 업데이트 응답 DTO
 * 입양 신청 상태가 성공적으로 변경되었을 때 반환되는 데이터 구조입니다.
 */
export class ApplicationStatusUpdateResponseDto {
    @ApiProperty({
        description: '상태 변경 완료 메시지',
        example: '입양 신청 상태가 성공적으로 업데이트되었습니다.',
    })
    message: string;
}
