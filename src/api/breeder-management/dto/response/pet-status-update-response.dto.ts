import { ApiProperty } from '@nestjs/swagger';

/**
 * 반려동물 상태 변경 응답 DTO
 * 분양 반려동물의 상태가 성공적으로 변경되었을 때 반환되는 데이터 구조입니다.
 */
export class PetStatusUpdateResponseDto {
    @ApiProperty({
        description: '상태 변경 완료 메시지',
        example: '반려동물 상태가 성공적으로 변경되었습니다.',
    })
    message: string;
}
