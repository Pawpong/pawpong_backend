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

/**
 * 수정 화면 복원용 폼 — 작성 요청(CreateBreederPetPostingRequestDto) 과 동일 shape.
 *
 * 표시용 가공을 하지 않는다. 클라이언트가 값을 그대로 폼에 부었다가
 * 저장 시 PATCH 로 되돌려 보낼 수 있어야 하므로 파일키/enum/숫자를 원본 그대로 싣는다.
 * (가격 단위 표기, relation 한글화, 날짜 포맷팅은 프론트 책임)
 */
export interface BreederPetPostingEditFormResult {
    name: string;
    breed: string;
    gender: 'male' | 'female';
    /** YYYY-MM-DD */
    birthDate: string;
    price: number;
    description: string;
    /** 파일키 배열 — 그대로 PATCH 에 되돌려 보낸다 */
    photos: string[];
    representativePhotoIndex: number;
    petType?: 'dog' | 'cat' | 'reptile';

    vaccinationStatus?: 'completed' | 'incomplete';
    /** date 는 YYYY-MM-DD */
    vaccinationRecords: Array<{ name: string; date: string; round: number }>;
    vaccinationIncompleteReason?: string;

    geneticTestStatus?: 'completed' | 'incomplete';
    geneticTestRecords: Array<{ date: string; institution: string; testName: string; result: string }>;
    geneticTestIncompleteReason?: string;

    parentPetSnapshots: Array<{
        relation: 'mother' | 'father';
        breed: string;
        name: string;
        birthDate?: string;
        photoFileName?: string;
    }>;

    breedingEnvironment?: {
        description?: string;
        photoFileNames?: string[];
        /** [deprecated] 단일 사진 — 구버전 데이터 호환 */
        photoFileName?: string;
    };
}

/**
 * 폼 파일키에 대응하는 표시용 URL.
 *
 * 임시저장 조회(BreederPetPostingDraftPhotoUrls)와 같은 계약이다 —
 * form 은 파일키를 그대로 두고, 미리보기 URL 을 같은 순서로 나란히 내려준다.
 */
export interface BreederPetPostingEditPhotoUrls {
    /** form.photos 와 같은 순서 */
    pet: string[];
    /** form.parentPetSnapshots 와 같은 순서. 사진 없는 행은 null */
    parents: (string | null)[];
    /** 사육 환경 대표(첫 장) 사진 — 임시저장 조회와 동일한 필드 */
    breedingEnvironment: string | null;
    /** form.breedingEnvironment.photoFileNames 와 같은 순서 (최대 5장) */
    breedingEnvironmentPhotos: string[];
}

export interface BreederPetPostingEditDetailResult {
    petId: string;
    form: BreederPetPostingEditFormResult;
    photoUrls: BreederPetPostingEditPhotoUrls;
    status: 'available' | 'reserved' | 'adopted';
    /** 마지막 수정 시각 (ISO 8601) */
    updatedAt: string;
}
