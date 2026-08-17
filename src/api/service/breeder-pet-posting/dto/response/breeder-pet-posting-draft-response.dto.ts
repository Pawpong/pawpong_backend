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

export class BreederPetPostingDraftDetailResponseDto {
    @ApiProperty({ description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;

    @ApiProperty({
        description: '저장했던 작성 폼 payload 그대로 (분양글 작성 요청과 동일 shape, 전 필드 옵션)',
        type: 'object',
        additionalProperties: true,
    })
    form: Record<string, unknown>;

    @ApiProperty({ description: '마지막 저장 시각 (ISO 8601)', example: '2026-08-17T10:30:00.000Z' })
    updatedAt: string;
}

export class DeleteBreederPetPostingDraftResponseDto {
    @ApiProperty({ description: '삭제된 임시저장 글 ID', example: '507f1f77bcf86cd799439099' })
    draftId: string;

    @ApiProperty({ description: '삭제 여부', example: true })
    deleted: boolean;
}
