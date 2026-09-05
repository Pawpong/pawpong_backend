import type { AiImageAdminJobListCommand, AiImageAdminJobPage } from '../types/ai-image-admin-job.type';

export const AI_IMAGE_ADMIN_JOB_READER_PORT = Symbol('AI_IMAGE_ADMIN_JOB_READER_PORT');

/**
 * 어드민 생성 작업 조회 경계.
 *
 * 사용자용 Job 조회(AI_IMAGE_JOB_READER_PORT)는 본인 것만 보도록 userId 로 잠겨 있다.
 * 운영 모니터링은 전체 사용자를 가로질러 봐야 하므로 별도 경계로 분리한다.
 */
export interface AiImageAdminJobReaderPort {
    findPage(command: AiImageAdminJobListCommand): Promise<AiImageAdminJobPage>;
}
