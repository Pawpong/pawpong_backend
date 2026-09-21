import type { AdoptionApplicationPersistData } from '../types/adoption-application.type';

export const ADOPTION_APPLICATION_WRITER_PORT = Symbol('ADOPTION_APPLICATION_WRITER_PORT');

export interface AdoptionApplicationWriterPort {
    /**
     * 동일 adopter × pet 에 대해 재신청을 막아야 할 신청이 있는지 확인.
     * 처리 중(consultation_pending / consultation_completed) + 확정(adoption_approved) 을 모두 본다.
     * adoption_rejected 만 종결 상태라 재신청을 허용한다.
     */
    existsOpenApplicationForPet(adopterId: string, petId: string): Promise<boolean>;

    create(data: AdoptionApplicationPersistData): Promise<{ applicationId: string }>;
}
