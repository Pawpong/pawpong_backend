import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProfileUpdateRequestDto {
    @ApiPropertyOptional({
        description: '입양자 이름',
        example: '홍길동',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: '입양자 전화번호',
        example: '010-1234-5678',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: '프로필 이미지 파일명 또는 URL',
        example: 'profiles/adopter-123.jpg',
    })
    @IsOptional()
    @IsString()
    profileImage?: string;
}
