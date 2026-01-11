import { ApiProperty } from '@nestjs/swagger';

/**
 * 다중 파일 삭제 응답 DTO
 */
export class DeleteFilesResponseDto {
    /**
     * 삭제된 파일 개수
     * @example 5
     */
    @ApiProperty({
        description: '삭제된 파일 개수',
        example: 5,
    })
    deletedCount: number;

    /**
     * 삭제 실패한 파일 목록
     * @example ["profiles/error.jpg"]
     */
    @ApiProperty({
        description: '삭제 실패한 파일 목록',
        example: ['profiles/error.jpg'],
        type: [String],
    })
    failedFiles: string[];
}
