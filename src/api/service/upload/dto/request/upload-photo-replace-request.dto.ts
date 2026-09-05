import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

function normalizeStringArrayInput(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value !== 'string' || !value.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.filter((item): item is string => typeof item === 'string');
        }
    } catch {
        return [value];
    }

    return [value];
}

export class UploadPhotoReplaceRequestDto {
    @ApiPropertyOptional({
        description: '유지할 기존 사진 경로 배열. 단일 문자열, 반복 필드, JSON 배열 문자열을 모두 지원합니다.',
        example: ['pets/available/photo-1.jpg', 'pets/available/photo-2.jpg'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => normalizeStringArrayInput(value))
    existingPhotos?: string[];
}
