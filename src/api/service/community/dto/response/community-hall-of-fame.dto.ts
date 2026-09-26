import { ApiProperty } from '@nestjs/swagger';

export class CommunityHallOfFameAuthorDto {
    @ApiProperty({ description: '작성자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '작성자 유형', enum: ['Adopter', 'Breeder'], example: 'Adopter' })
    authorModel: 'Adopter' | 'Breeder';

    @ApiProperty({ description: '닉네임 (수상 시점 스냅샷)', example: '포포' })
    nickname: string;

    @ApiProperty({ description: '프로필 이미지 URL', example: 'https://...', nullable: true })
    profileImageUrl: string | null;
}

export class CommunityHallOfFameWinnerDto {
    @ApiProperty({ description: '순위 (1~3)', example: 1 })
    rank: number;

    @ApiProperty({ description: '게시글 ID', example: '507f1f77bcf86cd799439011' })
    postId: string;

    @ApiProperty({ description: '좋아요 수 (수상 시점)', example: 6 })
    likeCount: number;

    @ApiProperty({ description: '댓글 수 (수상 시점)', example: 1 })
    commentCount: number;

    @ApiProperty({ description: '저장 수 (수상 시점)', example: 0 })
    saveCount: number;

    @ApiProperty({ description: '대표 사진 URL. 사진 없는 글이면 null', example: 'https://...', nullable: true })
    photoUrl: string | null;

    @ApiProperty({ description: '본문 발췌 (최대 120자)', example: '저녁에는 사냥놀이💗' })
    bodyExcerpt: string;

    @ApiProperty({ description: '작성자 정보', type: CommunityHallOfFameAuthorDto })
    author: CommunityHallOfFameAuthorDto;
}

export class CommunityHallOfFameResponseDto {
    @ApiProperty({ description: '회차 식별자 (YYYY-M-N)', example: '2026-9-2' })
    periodKey: string;

    @ApiProperty({ description: '회차 시작 (ISO 8601, UTC)', example: '2026-09-10T15:00:00.000Z' })
    startDate: string;

    @ApiProperty({ description: '회차 종료 — 다음 회차 시작 시각(배타적)', example: '2026-09-20T15:00:00.000Z' })
    endDate: string;

    @ApiProperty({ description: '회차 상태', enum: ['open', 'final'], example: 'final' })
    state: 'open' | 'final';

    @ApiProperty({ description: '마지막 집계 시각 (ISO 8601)', example: '2026-09-20T15:00:12.000Z' })
    refreshedAt: string;

    @ApiProperty({
        description: '수상작 0~3건. 해당 회차에 글이 없으면 빈 배열이며 폴백하지 않는다.',
        type: [CommunityHallOfFameWinnerDto],
    })
    winners: CommunityHallOfFameWinnerDto[];
}
