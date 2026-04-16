import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString } from 'class-validator';

export class BreederApprovalEmailPreviewRequestDto {
    @ApiProperty({ description: '수신 이메일', example: 'breeder@test.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '브리더 이름', example: '행복한 브리더' })
    @IsString()
    breederName: string;
}

export class BreederRejectionEmailPreviewRequestDto extends BreederApprovalEmailPreviewRequestDto {
    @ApiProperty({
        description: '반려 사유 목록',
        example: ['제출하신 사업자등록증이 유효하지 않습니다.', '동물등록증 사본이 누락되었습니다.'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    rejectionReasons: string[];
}

export class NewApplicationEmailPreviewRequestDto extends BreederApprovalEmailPreviewRequestDto {}

export class DocumentReminderEmailPreviewRequestDto extends BreederApprovalEmailPreviewRequestDto {}

export class ApplicationConfirmationEmailPreviewRequestDto {
    @ApiProperty({ description: '수신 이메일', example: 'adopter@test.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '입양자 이름', example: '테스트 입양자' })
    @IsString()
    applicantName: string;

    @ApiProperty({ description: '브리더 이름', example: '행복한 브리더' })
    @IsString()
    breederName: string;
}

export class NewReviewEmailPreviewRequestDto extends BreederApprovalEmailPreviewRequestDto {}
