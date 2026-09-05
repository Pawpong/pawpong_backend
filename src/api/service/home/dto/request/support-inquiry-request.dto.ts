import { Transform } from 'class-transformer';
import { IsIn, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SupportInquiryRequestDto {
    @ApiProperty({ maxLength: 2000, description: '개인정보를 제외한 서비스 이용 질문' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(1, 2000)
    question: string;

    @ApiProperty({ enum: ['adopter', 'breeder'] })
    @IsIn(['adopter', 'breeder'])
    userType: 'adopter' | 'breeder';
}
