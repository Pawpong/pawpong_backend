import { ApiProperty } from '@nestjs/swagger';

/**
 * 스토리지 파일 정보 응답 DTO
 */
export class StorageFileResponseDto {
    /**
     * 파일 경로 (버킷 내 키)
     * @example "profiles/abc123.jpg"
     */
    @ApiProperty({
        description: '파일 경로 (버킷 내 키)',
        example: 'profiles/abc123.jpg',
    })
    key: string;

    /**
     * 파일 크기 (바이트)
     * @example 1024000
     */
    @ApiProperty({
        description: '파일 크기 (바이트)',
        example: 1024000,
    })
    size: number;

    /**
     * 마지막 수정 시간
     * @example "2025-01-11T10:30:00.000Z"
     */
    @ApiProperty({
        description: '마지막 수정 시간',
        example: '2025-01-11T10:30:00.000Z',
    })
    lastModified: Date;

    /**
     * CDN URL
     * @example "https://kr.object.iwinv.kr/pawpong_bucket/profiles/abc123.jpg"
     */
    @ApiProperty({
        description: 'CDN URL',
        example: 'https://kr.object.iwinv.kr/pawpong_bucket/profiles/abc123.jpg',
    })
    url: string;

    /**
     * 폴더명
     * @example "profiles"
     */
    @ApiProperty({
        description: '폴더명',
        example: 'profiles',
    })
    folder: string;
}
