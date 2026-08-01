import { ApiProperty } from '@nestjs/swagger';

export class BreederPetPostingDeleteResponseDto {
    @ApiProperty({ description: '삭제된 분양글 ID', example: '507f1f77bcf86cd799439011' })
    petId: string;

    @ApiProperty({ description: '소프트 삭제 여부 (isActive=false 마킹 성공)', example: true })
    deleted: boolean;
}
