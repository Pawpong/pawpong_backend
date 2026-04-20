import { ApiProperty } from '@nestjs/swagger';

/**
 * 반려동물 수정 응답 DTO
 * 브리더가 등록된 반려동물 정보를 수정했을 때 반환되는 데이터 구조입니다.
 */
export class PetUpdateResponseDto {
    @ApiProperty({
        description: '반려동물 정보 수정 완료 메시지',
        example: '반려동물 정보가 성공적으로 수정되었습니다.',
    })
    message: string;
}
