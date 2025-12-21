import { ApiProperty } from '@nestjs/swagger';

/**
 * 개별 업로드 문서 응답 DTO
 */
export class UploadedDocumentDto {
    @ApiProperty({
        description: '문서 타입',
        example: 'idCard',
    })
    type: string;

    @ApiProperty({
        description: '미리보기용 Signed URL (1시간 유효)',
        example: 'https://storage.googleapis.com/...',
    })
    url: string;

    @ApiProperty({
        description: '파일 경로 (DB 저장용)',
        example: 'verification/breeder123/idCard_uuid.pdf',
    })
    fileName: string;

    @ApiProperty({
        description: '파일 크기 (bytes)',
        example: 102400,
    })
    size: number;

    @ApiProperty({
        description: '원본 파일명',
        example: '신분증.pdf',
        required: false,
    })
    originalFileName?: string;
}

/**
 * 브리더 인증 서류 업로드 응답 DTO
 */
export class UploadDocumentsResponseDto {
    @ApiProperty({
        description: '업로드된 문서 수',
        example: 2,
    })
    count: number;

    @ApiProperty({
        description: '브리더 레벨',
        example: 'new',
    })
    level: string;

    @ApiProperty({
        description: '업로드된 문서 목록',
        type: [UploadedDocumentDto],
    })
    documents: UploadedDocumentDto[];

    constructor(count: number, level: string, documents: UploadedDocumentDto[]) {
        this.count = count;
        this.level = level;
        this.documents = documents;
    }
}
