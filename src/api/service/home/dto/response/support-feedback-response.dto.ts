import { ApiProperty } from '@nestjs/swagger';

export class SupportFeedbackResponseDto {
    @ApiProperty({ description: 'DB 저장이 완료된 피드백의 접수번호' })
    receiptId: string;
}
