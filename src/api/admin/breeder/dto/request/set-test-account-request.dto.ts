import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * 테스트 계정 설정 요청 DTO
 */
export class SetTestAccountRequestDto {
    @ApiProperty({
        description: '테스트 계정 여부 (true: 테스트 계정, false: 일반 계정)',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    isTestAccount: boolean;
}
