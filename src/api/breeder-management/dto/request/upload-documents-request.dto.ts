import { IsString, IsNotEmpty, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * 브리더 인증 서류 업로드 요청 DTO
 * 인증된 브리더가 서류를 업로드할 때 사용
 */
export class UploadDocumentsRequestDto {
    /**
     * 서류 타입 배열 (JSON 문자열로 전송)
     * @example ["idCard", "animalProductionLicense"]
     */
    @ApiProperty({
        description: '서류 타입 배열 (JSON 문자열)',
        example: '["idCard", "animalProductionLicense"]',
    })
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value];
            }
        }
        return value;
    })
    types: string[];

    /**
     * 브리더 레벨
     * @example "new"
     */
    @ApiProperty({
        description: '브리더 레벨',
        example: 'new',
        enum: ['new', 'elite'],
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(['new', 'elite'])
    level: 'new' | 'elite';
}
