import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional, IsBoolean } from 'class-validator';

/**
 * 전화번호 화이트리스트 추가 요청 DTO
 */
export class AddPhoneWhitelistRequestDto {
    @ApiProperty({
        description: '전화번호 (하이픈 없이)',
        example: '01012345678',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^01[0-9]{8,9}$/, { message: '올바른 전화번호 형식이 아닙니다.' })
    phoneNumber: string;

    @ApiProperty({
        description: '화이트리스트 추가 사유',
        example: '관리자 테스트 계정',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}

/**
 * 전화번호 화이트리스트 수정 요청 DTO
 */
export class UpdatePhoneWhitelistRequestDto {
    @ApiProperty({
        description: '화이트리스트 추가 사유',
        example: '개발자 테스트 계정',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: '활성 상태',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
