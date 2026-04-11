import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CheckFileReferencesRequestDto {
    @ApiProperty({
        description: 'DB 참조 여부를 확인할 파일 키 목록',
        example: ['profiles/abc123.jpg', 'pets/available/def456.jpg'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1, { message: '최소 1개 이상의 파일 키가 필요합니다.' })
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    fileKeys!: string[];
}
