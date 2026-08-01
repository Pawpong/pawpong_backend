import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckSocialUserRequestDto {
    @ApiProperty({
        description: '소셜 로그인 제공자',
        enum: ['google', 'kakao', 'naver'],
        example: 'kakao',
    })
    @IsEnum(['google', 'kakao', 'naver'])
    provider: 'google' | 'kakao' | 'naver';

    @ApiProperty({
        description: '소셜 로그인 제공자에서 전달한 사용자 고유 ID',
        example: '4479198661',
    })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({
        description: '소셜 로그인 제공자가 제공한 이메일 주소',
        example: 'user@kakao.com',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;
}
