import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, ArrayMinSize } from 'class-validator';

/**
 * 다중 파일 삭제 요청 DTO
 */
export class DeleteFilesRequestDto {
    /**
     * 삭제할 파일 경로 목록
     * @example ["profiles/abc123.jpg", "pets/available/def456.jpg"]
     */
    @ApiProperty({
        description: '삭제할 파일 경로 목록',
        example: ['profiles/abc123.jpg', 'pets/available/def456.jpg'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1, { message: '최소 1개 이상의 파일을 선택해야 합니다.' })
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    fileNames: string[];
}
