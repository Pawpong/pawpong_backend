import { ApiProperty } from '@nestjs/swagger';

/**
 * 반려동물 삭제 응답 DTO
 * 브리더가 등록된 반려동물을 삭제했을 때 반환되는 데이터 구조입니다.
 */
export class PetRemoveResponseDto {
    @ApiProperty({
        description: '반려동물 삭제 완료 메시지',
        example: '반려동물이 성공적으로 삭제되었습니다.',
    })
    message: string;
}
