import { ApiProperty } from '@nestjs/swagger';

/**
 * 반려동물 추가 응답 DTO
 * 브리더가 반려동물을 성공적으로 등록했을 때 반환되는 데이터 구조입니다.
 */
export class PetAddResponseDto {
    /**
     * 등록된 반려동물 고유 ID
     * @example "507f1f77bcf86cd799439088"
     */
    @ApiProperty({
        description: '등록된 반려동물 고유 ID',
        example: '507f1f77bcf86cd799439088',
    })
    petId: string;

    @ApiProperty({
        description: '등록 완료 메시지',
        example: '부모견/부모묘가 성공적으로 등록되었습니다.',
    })
    message: string;
}
