import type { AiImageFilterSnapshot } from '../../../../service/ai-image/shared/application/types/ai-image-filter-snapshot.type';
import type { AiImageFilterCreateCommand, AiImageFilterUpdateCommand } from '../types/ai-image-admin-filter-command.type';

export const AI_IMAGE_ADMIN_FILTER_WRITER_PORT = Symbol('AI_IMAGE_ADMIN_FILTER_WRITER_PORT');

export interface AiImageAdminFilterWriterPort {
    create(data: AiImageFilterCreateCommand): Promise<AiImageFilterSnapshot>;
    /** 대상이 없으면 null */
    update(filterId: string, data: AiImageFilterUpdateCommand): Promise<AiImageFilterSnapshot | null>;
    /** 삭제 여부 (대상 없으면 false) */
    delete(filterId: string): Promise<boolean>;
}
