import { ApiProperty } from '@nestjs/swagger';

export class SaveBreederPetPostingDraftResponseDto {
    @ApiProperty({ description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;
}

export class BreederPetPostingDraftCardResponseDto {
    @ApiProperty({ description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;

    @ApiProperty({
        description: '품종 및 이름 (미입력 시 null)',
        example: '레오파드게코 도마뱀(만다린)',
        nullable: true,
    })
    name: string | null;

    @ApiProperty({ description: '품종 (미입력 시 null)', example: '레오파드게코', nullable: true })
    breed: string | null;

    @ApiProperty({ description: '대표 사진 signed URL (사진 미입력 시 null)', nullable: true })
    primaryPhotoUrl: string | null;

    @ApiProperty({ description: '마지막 저장 시각 (ISO 8601)', example: '2026-08-17T10:30:00.000Z' })
    updatedAt: string;
}

/**
 * 임시저장 사진의 표시용 URL.
 *
 * form 에는 파일키만 들어 있고 클라이언트는 키를 URL 로 바꿀 수단이 없어
 * 미리보기를 그릴 수 없었다. 재저장·발행 때는 form 의 키를 그대로 돌려보내야 하므로
 * form 은 건드리지 않고 표시용 URL 을 같은 순서로 나란히 내려준다.
 */
export class BreederPetPostingDraftPhotoUrlsDto {
    @ApiProperty({
        description: '분양 개체 사진 URL — form.photos 와 같은 순서',
        type: [String],
        example: ['https://cdn.example.com/pet-postings/a.jpg'],
    })
    pet: string[];

    @ApiProperty({
        description: '부모 사진 URL — form.parentPetSnapshots 와 같은 순서. 사진 없는 행은 null',
        type: [String],
        nullable: true,
        example: ['https://cdn.example.com/pet-postings/mother.jpg', null],
    })
    parents: (string | null)[];

    @ApiProperty({
        description: '사육 환경 사진 URL (없으면 null)',
        nullable: true,
        example: 'https://cdn.example.com/pet-postings/env.jpg',
    })
    breedingEnvironment: string | null;
}

export class BreederPetPostingDraftDetailResponseDto {
    @ApiProperty({ description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;

    @ApiProperty({
        description: '저장했던 작성 폼 payload 그대로 (분양글 작성 요청과 동일 shape, 전 필드 옵션)',
        type: 'object',
        additionalProperties: true,
    })
    form: Record<string, unknown>;

    @ApiProperty({
        description: '사진 미리보기용 URL (form 의 파일키와 같은 순서)',
        type: BreederPetPostingDraftPhotoUrlsDto,
    })
    photoUrls: BreederPetPostingDraftPhotoUrlsDto;

    @ApiProperty({ description: '마지막 저장 시각 (ISO 8601)', example: '2026-08-17T10:30:00.000Z' })
    updatedAt: string;
}

export class DeleteBreederPetPostingDraftResponseDto {
    @ApiProperty({ description: '삭제된 임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;

    @ApiProperty({ description: '삭제 여부', example: true })
    deleted: boolean;
}
