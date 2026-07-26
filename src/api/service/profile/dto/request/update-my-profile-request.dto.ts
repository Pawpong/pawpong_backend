import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMyProfileRequestDto {
    @ApiPropertyOptional({
        description: '한 줄 소개. trim 후 200자 이내. 빈 문자열은 한 줄 소개 비움을 의미한다.',
        example: '도심속 도마뱀 사장님',
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    bio?: string;
}
