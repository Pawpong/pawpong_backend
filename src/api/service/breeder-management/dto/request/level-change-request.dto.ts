import { Type } from 'class-transformer';
import { IsArray, IsIn, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { DocumentInfoDto } from './submit-documents-request.dto';

export class LevelChangeRequestDto {
    @ApiProperty({
        description: '신청할 브리더 등급',
        example: 'elite',
        enum: ['elite'],
    })
    @IsIn(['elite'])
    requestedLevel: 'elite';

    @ApiProperty({
        description: '추가 업로드한 Elite 심사 서류 목록. 기존 승인 문서는 서버에서 자동 병합합니다.',
        type: [DocumentInfoDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentInfoDto)
    documents: DocumentInfoDto[];
}
