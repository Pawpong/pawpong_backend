/**
 * 업로드 파일 제한 — 컨트롤러(multer)와 도메인 정책이 같은 값을 본다.
 *
 * multer 는 스트리밍 중 한도를 넘기면 즉시 중단하므로 컨트롤러 쪽 limits 가 1차 방어다.
 * Nest 기본 저장소가 메모리이고 운영 힙이 1GB(--max-old-space-size=1024)로 묶여 있어,
 * 한도 없이 받으면 파일이 전부 힙에 적재된다.
 * 도메인 정책(UploadFilePolicyService)은 형식과 크기를 다시 확인해 사용자에게 사유를 알려준다.
 */
export const UPLOAD_MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const UPLOAD_MAX_FILE_COUNT = {
    multiple: 10,
    representativePhotos: 4,
    petPhotos: 5,
} as const;

/** multer 인터셉터에 넘기는 공통 limits */
export const UPLOAD_MULTER_LIMITS = { fileSize: UPLOAD_MAX_FILE_SIZE_BYTES } as const;
