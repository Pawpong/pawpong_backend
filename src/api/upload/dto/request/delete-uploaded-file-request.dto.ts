import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUploadedFileRequestDto {
    @ApiProperty({
        description: '삭제할 파일 경로',
        example: 'profiles/abc123.jpg',
    })
    @IsString({ message: '파일명이 없습니다' })
    @IsNotEmpty({ message: '파일명이 없습니다' })
    fileName!: string;
}
