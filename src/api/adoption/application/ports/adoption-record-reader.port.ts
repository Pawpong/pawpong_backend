import type { AdoptionPetSnapshot } from './adoption-pet-reader.port';

export const ADOPTION_RECORD_READER_PORT = Symbol('ADOPTION_RECORD_READER_PORT');

/**
 * 입양자가 실제로 입양 완료(adoption_approved) 한 펫의 record.
 * 카드 응답에는 펫 정보 + 입양 완료 시각이 포함된다.
 */
export interface MyAdoptedRecordSnapshot {
    pet: AdoptionPetSnapshot;
    /** 입양 승인이 확정된 시각 (application.processedAt 우선, 없으면 appliedAt) */
    adoptedAt: Date;
}

export interface ListMyAdoptedQuery {
    adopterId: string;
    skip: number;
    limit: number;
}

export interface ListMyAdoptedResult {
    items: MyAdoptedRecordSnapshot[];
    totalItems: number;
}

export interface AdoptionRecordReaderPort {
    listMyAdopted(query: ListMyAdoptedQuery): Promise<ListMyAdoptedResult>;
}
