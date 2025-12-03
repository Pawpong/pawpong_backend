import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
    @ApiProperty({
        description: '업로드된 파일 URL (CDN URL)',
        example: 'https://cdn.pawpong.kr/banners/3384fec2-7e9a-4467-aba5-6b61b1c52cb2.jpg',
    })
    url: string;

    @ApiProperty({
        description: 'CDN URL (signed URL)',
        example: 'https://cdn.pawpong.kr/banners/3384fec2-7e9a-4467-aba5-6b61b1c52cb2.jpg?Expires=...',
    })
    cdnUrl: string;

    @ApiProperty({
        description: '파일명 (경로 포함)',
        example: 'banners/3384fec2-7e9a-4467-aba5-6b61b1c52cb2.jpg',
    })
    filename: string;

    @ApiProperty({
        description: '파일명 (camelCase, 프론트엔드 호환)',
        example: 'banners/3384fec2-7e9a-4467-aba5-6b61b1c52cb2.jpg',
    })
    fileName: string;

    @ApiProperty({
        description: '파일 크기 (bytes)',
        example: 164190,
    })
    size: number;

    constructor(url: string, filename: string, size: number) {
        this.url = url;
        this.cdnUrl = url; // CDN URL은 url과 동일
        this.filename = filename;
        this.fileName = filename; // camelCase 버전 추가 (프론트엔드 호환)
        this.size = size;
    }
}
