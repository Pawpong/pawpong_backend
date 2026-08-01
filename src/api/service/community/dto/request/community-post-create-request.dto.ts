import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommunityPostRequestDto {
    @ApiPropertyOptional({ description: '제목 (선택, ≤100)', example: '오늘의 파이리' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional({
        description: '본문 (≤2000). 발행(status=published) 글은 필수, 임시저장(status=draft) 은 비어있어도 허용.',
        example: '너무 이쁜 아이가 태어났어요...',
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    body?: string;

    @ApiPropertyOptional({
        description: '사진 파일명 배열 (≤10). upload 모듈에서 미리 업로드된 파일명만 받음',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    photos?: string[];

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '자유 카테고리 텍스트 (≤50)', example: '레오파드' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;

    @ApiPropertyOptional({
        description: '공개 범위 (기본 public). public=전체공개, followers=팔로워공개, private=나만보기',
        enum: ['public', 'followers', 'private'],
        default: 'public',
    })
    @IsOptional()
    @IsEnum(['public', 'followers', 'private'])
    visibility?: 'public' | 'followers' | 'private';

    @ApiPropertyOptional({
        description: '발행 상태 (기본 published). draft 로 보내면 임시저장. 임시저장은 본문 없이도 저장 가능.',
        enum: ['draft', 'published'],
        default: 'published',
    })
    @IsOptional()
    @IsEnum(['draft', 'published'])
    status?: 'draft' | 'published';
}
