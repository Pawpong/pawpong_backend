import { ApiProperty } from '@nestjs/swagger';

/**
 * 파일 참조 정보 DTO
 */
export class FileReferenceDto {
    @ApiProperty({ description: '파일 키(경로)', example: 'profiles/abc123.jpg' })
    fileKey: string;

    @ApiProperty({ description: 'DB에서 참조 중인지 여부', example: true })
    isReferenced: boolean;

    @ApiProperty({
        description: '참조 위치 목록',
        example: [{ collection: 'breeders', field: 'profile.representativePhotos', count: 1 }],
    })
    references: {
        collection: string;
        field: string;
        count: number;
    }[];
}

/**
 * 파일 참조 확인 응답 DTO
 */
export class FileReferenceResponseDto {
    @ApiProperty({ description: '확인된 파일 목록', type: [FileReferenceDto] })
    files: FileReferenceDto[];

    @ApiProperty({ description: '참조된 파일 수', example: 10 })
    referencedCount: number;

    @ApiProperty({ description: '참조되지 않은 파일 수 (고아 파일)', example: 5 })
    orphanedCount: number;
}
