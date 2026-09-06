import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReactivateAccountRequestDto {
    /**
     * 소셜 로그인 콜백이 전달한 계정 복구 토큰
     * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    @ApiProperty({
        description: '소셜 로그인 콜백이 리다이렉트 쿼리로 전달한 계정 복구 토큰 (유효시간 10분)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty()
    reactivationToken: string;
}
