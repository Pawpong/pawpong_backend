import { ApiProperty } from '@nestjs/swagger';

export class CreateAdoptionApplicationResponseDto {
    @ApiProperty({ description: '생성된 입양 신청 ID', example: '507f1f77bcf86cd799439011' })
    applicationId: string;

    @ApiProperty({
        description: '신청 상태 (신규 신청은 항상 consultation_pending)',
        example: 'consultation_pending',
    })
    status: 'consultation_pending';
}
