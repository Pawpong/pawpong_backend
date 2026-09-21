import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * 약관 수정 요청 DTO — code/version 은 문서의 정체성이라 수정하지 않는다.
 * 새 버전이 필요하면 생성 API로 새 문서를 만든다.
 */
export class TermsUpdateRequestDto {
    @ApiProperty({
        description: '약관 제목',
        example: '서비스 이용약관',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: '약관 본문 (markdown 또는 html)',
        example: '## 서비스 이용약관\n\n제1조 ...',
        required: false,
    })
    @IsString()
    @IsOptional()
    body?: string;

    @ApiProperty({
        description: '필수 동의 여부',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;
}
