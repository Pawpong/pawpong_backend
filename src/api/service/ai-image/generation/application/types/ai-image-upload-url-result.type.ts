/** presigned 업로드 URL 발급 결과 */
export interface AiImageUploadUrlResult {
    /** 클라이언트가 PUT 할 presigned URL */
    uploadUrl: string;
    /** 업로드 완료 후 생성 요청에 넘길 S3 파일키 */
    inputObjectKey: string;
    /** URL 유효 시간(초) */
    expiresInSeconds: number;
}
