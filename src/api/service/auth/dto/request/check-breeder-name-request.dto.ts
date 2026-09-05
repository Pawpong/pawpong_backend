import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckBreederNameRequestDto {
    @ApiProperty({
        description: '중복 여부를 확인할 브리더 상호명',
        example: '포포 캐터리',
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30, { message: '브리더 상호명은 최대 30자까지 가능합니다.' })
    breederName: string;
}
