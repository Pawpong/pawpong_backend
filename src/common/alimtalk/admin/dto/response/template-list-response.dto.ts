import { ApiProperty } from '@nestjs/swagger';
import { AlimtalkButton } from '../../../../../schema/alimtalk-template.schema';

/**
 * 알림톡 템플릿 목록 조회 응답 DTO
 */
export class TemplateListItemDto {
    @ApiProperty({
        description: '템플릿 코드',
        example: 'VERIFICATION_CODE',
    })
    templateCode: string;

    @ApiProperty({
        description: '솔라피 템플릿 ID',
        example: 'KA01TP251221145150608gmUJUCLiOfs',
    })
    templateId: string;

    @ApiProperty({
        description: '템플릿 이름',
        example: '회원가입 인증번호',
    })
    name: string;

    @ApiProperty({
        description: '템플릿 설명',
        example: '회원가입 시 전화번호 인증을 위한 인증번호 발송',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: '필수 변수 목록',
        example: ['인증번호'],
        type: [String],
    })
    requiredVariables: string[];

    @ApiProperty({
        description: '알림톡 실패 시 SMS 대체 발송 여부',
        example: true,
    })
    fallbackToSms: boolean;

    @ApiProperty({
        description: '템플릿 활성화 여부',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: '카카오 검수 상태',
        example: 'approved',
        enum: ['pending', 'approved', 'rejected', 're_review'],
    })
    reviewStatus: string;

    @ApiProperty({
        description: '메모 (관리자용)',
        required: false,
    })
    memo?: string;

    @ApiProperty({
        description: '알림톡 버튼 목록',
        type: 'array',
        required: false,
    })
    buttons: AlimtalkButton[];

    @ApiProperty({
        description: '생성 일시',
        example: '2025-12-22T10:30:00.000Z',
    })
    createdAt: string;

    @ApiProperty({
        description: '수정 일시',
        example: '2025-12-22T10:30:00.000Z',
    })
    updatedAt: string;
}

/**
 * 알림톡 템플릿 전체 목록 응답 DTO
 */
export class TemplateListResponseDto {
    @ApiProperty({
        description: '템플릿 목록',
        type: [TemplateListItemDto],
    })
    templates: TemplateListItemDto[];

    @ApiProperty({
        description: '전체 템플릿 개수',
        example: 7,
    })
    totalCount: number;
}
