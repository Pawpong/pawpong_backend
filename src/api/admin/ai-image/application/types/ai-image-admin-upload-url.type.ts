import type { AiImageAdminAssetPurpose } from '../../../../service/ai-image/shared/domain/services/ai-image-object-key.service';

/** 어드민 애셋 업로드 URL 발급 명령 (내부 타입 — request DTO 를 그대로 넘기지 않는다) */
export interface AiImageAdminUploadUrlCommand {
    purpose: AiImageAdminAssetPurpose;
    contentType: string;
}

/** 발급 결과 — 어드민은 uploadUrl 로 직접 PUT 한 뒤 objectKey 를 필터 저장/미리보기에 넘긴다 */
export interface AiImageAdminUploadUrlResult {
    uploadUrl: string;
    objectKey: string;
    expiresInSeconds: number;
}
