import { IsString, IsNotEmpty, IsArray, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 개별 문서 정보 DTO
 */
export class DocumentInfoDto {
    @ApiProperty({
        description: '문서 타입',
        example: 'idCard',
    })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({
        description: '파일 경로 (filename)',
        example: 'verification/breeder123/idCard_uuid.pdf',
    })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({
        description: '원본 파일명',
        example: '신분증.pdf',
        required: false,
    })
    @IsString()
    @IsOptional()
    originalFileName?: string;
}

/**
 * 브리더 인증 서류 제출 요청 DTO
 * 인증된 브리더가 서류를 제출할 때 사용 (간소화된 버전)
 */
export class SubmitDocumentsRequestDto {
    /**
     * 브리더 레벨
     * @example "new"
     */
    @ApiProperty({
        description: '브리더 레벨',
        example: 'new',
        enum: ['new', 'elite'],
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(['new', 'elite'])
    level: 'new' | 'elite';

    /**
     * 제출 서류 목록
     */
    @ApiProperty({
        description: '제출 서류 목록',
        type: [DocumentInfoDto],
        example: [
            { type: 'idCard', fileName: 'verification/breeder123/idCard_uuid.pdf' },
            { type: 'animalProductionLicense', fileName: 'verification/breeder123/license_uuid.pdf' },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentInfoDto)
    documents: DocumentInfoDto[];

    /**
     * 이메일로 신청서 제출 여부
     */
    @ApiProperty({
        description: '이메일로 신청서 제출 여부',
        example: false,
        required: false,
    })
    @IsOptional()
    submittedByEmail?: boolean;
}
