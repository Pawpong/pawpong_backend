import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitContestEntryRequestDto {
    @ApiProperty({ description: 'S3에 업로드된 사진 파일명', example: 'contest/uuid-photo.jpg' })
    @IsString()
    @IsNotEmpty()
    photoFileName: string;

    @ApiProperty({ description: '한 줄 소개 (최대 200자)', example: '이번달 가장 귀여운 레오파드 게코입니다!' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description: string;
}
