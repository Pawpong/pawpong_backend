/**
 * application/domain 계층 내부 결과 타입.
 * 컨트롤러 경계 밖으로 나가지 않으며 @ApiProperty 데코레이터에 의존하지 않는다.
 */

export interface BreederPetPostingCardResult {
    petId: string;
    name: string;
    breed: string;
    petType: 'dog' | 'cat' | 'reptile';
    gender: 'male' | 'female';
    /** 출생일 ISO 문자열 — 카드에서 나이 대신 생년월일을 노출할 때 사용한다 */
    birthDate: string;
    ageDescription: string;
    price: number;
    status: 'available' | 'reserved' | 'adopted';
    primaryPhotoUrl: string;
    photoUrls: string[];
    description: string;
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    chatCount: number;
    createdAt: string;
}
