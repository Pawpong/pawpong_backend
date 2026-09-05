import { ApiProperty } from '@nestjs/swagger';

export class CreateBreederPetPostingResponseDto {
    @ApiProperty({ description: '생성된 분양글(분양 가능 동물) ID', example: '507f1f77bcf86cd799439011' })
    petId: string;
}
