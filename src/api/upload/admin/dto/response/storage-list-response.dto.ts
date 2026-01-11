import { ApiProperty } from '@nestjs/swagger';
import { StorageFileResponseDto } from './storage-file-response.dto';

/**
 * 스토리지 파일 목록 응답 DTO
 */
export class StorageListResponseDto {
    /**
     * 파일 목록
     */
    @ApiProperty({
        description: '파일 목록',
        type: [StorageFileResponseDto],
    })
    files: StorageFileResponseDto[];

    /**
     * 총 파일 개수
     * @example 225
     */
    @ApiProperty({
        description: '총 파일 개수',
        example: 225,
    })
    totalFiles: number;

    /**
     * 폴더별 통계
     * @example {"profiles": {"count": 71, "totalSize": 5242880}, "pets/available": {"count": 19, "totalSize": 3145728}}
     */
    @ApiProperty({
        description: '폴더별 통계 (파일 개수 및 총 크기)',
        example: {
            profiles: { count: 71, totalSize: 5242880 },
            'pets/available': { count: 19, totalSize: 3145728 },
        },
    })
    folderStats: Record<string, { count: number; totalSize: number }>;

    /**
     * 더 많은 파일이 있는지 여부
     * @example false
     */
    @ApiProperty({
        description: '더 많은 파일이 있는지 여부 (1000개 제한)',
        example: false,
    })
    isTruncated: boolean;
}
