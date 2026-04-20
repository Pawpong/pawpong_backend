import { ApiProperty } from '@nestjs/swagger';

export class InquiryCreateResponseDto {
    @ApiProperty({ description: '생성된 문의 ID', example: '507f1f77bcf86cd799439011' })
    inquiryId: string;
}
