import { ApiProperty } from '@nestjs/swagger';

class SupportFaqResponseDto {
    @ApiProperty() faqId: string;
    @ApiProperty() question: string;
    @ApiProperty() answer: string;
}
export class SupportInquiryResponseDto {
    @ApiProperty({ type: [SupportFaqResponseDto] }) sources: SupportFaqResponseDto[];
    @ApiProperty() needsHumanSupport: boolean;
}
