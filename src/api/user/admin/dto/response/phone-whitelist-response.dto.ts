import { ApiProperty } from '@nestjs/swagger';

/**
 * 전화번호 화이트리스트 응답 DTO
 */
export class PhoneWhitelistResponseDto {
    @ApiProperty({
        description: '화이트리스트 ID',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: '전화번호',
        example: '01012345678',
    })
    phoneNumber: string;

    @ApiProperty({
        description: '설명',
        example: '관리자 테스트 계정',
    })
    description: string;

    @ApiProperty({
        description: '활성 상태',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: '등록한 관리자 ID',
        example: '507f1f77bcf86cd799439011',
        required: false,
    })
    createdBy?: string;

    @ApiProperty({
        description: '생성일시',
        example: '2025-01-01T00:00:00.000Z',
        required: false,
    })
    createdAt?: Date;

    @ApiProperty({
        description: '수정일시',
        example: '2025-01-01T00:00:00.000Z',
        required: false,
    })
    updatedAt?: Date;
}

/**
 * 전화번호 화이트리스트 목록 응답 DTO
 */
export class PhoneWhitelistListResponseDto {
    @ApiProperty({
        description: '화이트리스트 목록',
        type: [PhoneWhitelistResponseDto],
    })
    items: PhoneWhitelistResponseDto[];

    @ApiProperty({
        description: '전체 개수',
        example: 5,
    })
    total: number;
}
