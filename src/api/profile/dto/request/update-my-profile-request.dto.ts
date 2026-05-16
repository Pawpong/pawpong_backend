import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class UpdateMyProfileLocationDto {
    @ApiPropertyOptional({ description: '시 (예: "서울")', maxLength: 50, example: '서울' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    city?: string;

    @ApiPropertyOptional({ description: '구 (예: "금천구")', maxLength: 50, example: '금천구' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    district?: string;

    @ApiPropertyOptional({
        description:
            '상세 주소 (예: "독산로 OO길 OO"). PII 라 공개 응답(다른 사용자가 보는 브리더 프로필)에는 노출되지 않는다.',
        maxLength: 200,
        example: '독산로 12길 5',
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    address?: string;
}

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

    @ApiPropertyOptional({
        description:
            '사업장 위치 — 브리더 전용 (Figma 290:668 마이홈 "사업장 위치를 작성해주세요" CTA). 입양자가 보내면 400.',
        type: UpdateMyProfileLocationDto,
    })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateMyProfileLocationDto)
    location?: UpdateMyProfileLocationDto;
}
