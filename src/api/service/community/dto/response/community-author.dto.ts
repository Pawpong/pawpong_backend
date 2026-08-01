import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 커뮤니티 작성자 요약 (게시글·댓글 공통).
 *
 * 카드/댓글 DTO 가 서로를 참조하면서 순환 import 가 되면 Swagger 데코레이터가
 * 평가 시점에 undefined 를 받는다. 그래서 공통 타입은 이 파일에 따로 둔다.
 */
export class CommunityAuthorResponseDto {
    @ApiProperty({ description: '작성자 ID (마이홈 연결용)', example: '507f1f77bcf86cd799439022' })
    userId: string;

    @ApiProperty({ description: '작성자 닉네임 (작성 시점 스냅샷)', example: '파이리귀여워' })
    nickname: string;

    @ApiPropertyOptional({ description: '작성자 프로필 이미지 signed URL' })
    profileImageUrl?: string;
}
