import type { AdoptionApplicationPersistData } from '../types/adoption-application.type';

export const ADOPTION_APPLICATION_WRITER_PORT = Symbol('ADOPTION_APPLICATION_WRITER_PORT');

export interface AdoptionApplicationWriterPort {
    /**
     * 동일 adopter × pet 에 대해 처리 중(consultation_pending / consultation_completed)인 신청이 있는지 확인.
     * adoption_approved / adoption_rejected 는 종결 상태라 신규 신청 허용.
     */
    existsOpenApplicationForPet(adopterId: string, petId: string): Promise<boolean>;

    create(data: AdoptionApplicationPersistData): Promise<{ applicationId: string }>;
}
