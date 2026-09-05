import { ApiProperty } from '@nestjs/swagger';

export class ContestEntryDto {
    @ApiProperty({ description: '항목 ID' })
    id: string;

    @ApiProperty({ description: '제출자 유저 ID' })
    userId: string;

    @ApiProperty({ description: '제출자 표시명' })
    userDisplayName: string;

    @ApiProperty({ description: '제출자 프로필 이미지 URL', nullable: true, required: false })
    userProfileImageUrl: string | null;

    @ApiProperty({ description: '사진 signed URL' })
    photoUrl: string;

    @ApiProperty({ description: '설명' })
    description: string;

    @ApiProperty({ description: '받은 투표 수' })
    voteCount: number;

    @ApiProperty({ description: '순위 (1~3, null = 미집계)', nullable: true, required: false })
    rank: number | null;

    @ApiProperty({ description: '현재 유저가 이 항목에 투표했는지 여부' })
    hasVoted: boolean;

    @ApiProperty({ description: '현재 유저의 항목인지 여부' })
    isMyEntry: boolean;

    @ApiProperty({ description: '제출 시각 ISO' })
    createdAt: string;
}

export class ContestInfoDto {
    @ApiProperty({ description: '콘테스트 ID' })
    id: string;

    @ApiProperty({ description: '콘테스트 제목', example: '이번달 땅예의 전당 주인공이 되어보세요!' })
    title: string;

    @ApiProperty({ description: '콘테스트 설명' })
    description: string;

    @ApiProperty({ description: '참여 혜택 안내 문구' })
    benefitText: string;

    @ApiProperty({ description: '시작일 ISO' })
    startDate: string;

    @ApiProperty({ description: '종료일 ISO' })
    endDate: string;

    @ApiProperty({ description: '상태', enum: ['active', 'ended'] })
    status: string;

    @ApiProperty({ description: '참여자 수' })
    participantCount: number;
}
