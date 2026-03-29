import { ApiProperty } from '@nestjs/swagger';

/**
 * 앱 버전 체크 응답 DTO (RN 앱용 공개 API)
 * 앱 시작 시 강제/권장 업데이트 여부를 전달
 */
export class AppVersionCheckResponseDto {
    /**
     * 강제 업데이트 필요 여부
     * true면 앱 사용 불가 + 스토어 강제 이동
     */
    @ApiProperty({
        description: '강제 업데이트 필요 여부 (true면 앱 사용 불가)',
        example: false,
    })
    needsForceUpdate: boolean;

    /**
     * 권장 업데이트 필요 여부
     * true면 닫기 가능한 업데이트 안내 표시
     */
    @ApiProperty({
        description: '권장 업데이트 필요 여부 (true면 닫기 가능한 안내 표시)',
        example: true,
    })
    needsRecommendUpdate: boolean;

    /**
     * 최신 버전
     */
    @ApiProperty({
        description: '최신 버전',
        example: '1.2.0',
    })
    latestVersion: string;

    /**
     * 표시할 메시지 (강제 or 권장, 없으면 빈 문자열)
     */
    @ApiProperty({
        description: '표시할 업데이트 메시지',
        example: '새로운 기능이 추가되었습니다.',
    })
    message: string;

    /**
     * 이동할 스토어 URL (플랫폼에 맞게 자동 선택)
     */
    @ApiProperty({
        description: '이동할 스토어 URL',
        example: 'https://apps.apple.com/app/pawpong/id000000000',
    })
    storeUrl: string;
}
