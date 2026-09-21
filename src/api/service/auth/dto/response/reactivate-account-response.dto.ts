import { ApiProperty } from '@nestjs/swagger';

class ReactivatedUserInfoDto {
    @ApiProperty({ description: '사용자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '이메일', example: 'user@pawpong.kr' })
    email: string;

    @ApiProperty({ description: '표시 이름 (입양자는 닉네임, 브리더는 상호명)', example: '포포' })
    name: string;

    @ApiProperty({ description: '프로필 이미지 파일명', example: 'profile-123.jpg', required: false })
    profileImage?: string;
}

export class ReactivateAccountResponseDto {
    @ApiProperty({
        description: 'JWT 액세스 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT 리프레시 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refreshToken: string;

    @ApiProperty({ description: '액세스 토큰 만료 시간 (초)', example: 3600 })
    accessTokenExpiresIn: number;

    @ApiProperty({ description: '리프레시 토큰 만료 시간 (초)', example: 604800 })
    refreshTokenExpiresIn: number;

    @ApiProperty({ description: '복구된 계정의 역할', example: 'adopter', enum: ['adopter', 'breeder'] })
    role: 'adopter' | 'breeder';

    @ApiProperty({ description: '복구된 사용자 정보', type: ReactivatedUserInfoDto })
    userInfo: ReactivatedUserInfoDto;
}
