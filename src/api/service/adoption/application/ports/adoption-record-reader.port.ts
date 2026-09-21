import type { ReapplicationBlockingStatus } from '../../../../../common/enum/user.enum';
import type { AdoptionPetSnapshot } from './adoption-pet-reader.port';

export const ADOPTION_RECORD_READER_PORT = Symbol('ADOPTION_RECORD_READER_PORT');

/**
 * 입양자가 실제로 입양 완료(adoption_approved) 한 펫의 record.
 * 카드 응답에는 펫 정보 + 입양 완료 시각이 포함된다.
 */
export interface MyAdoptedRecordSnapshot {
    pet: AdoptionPetSnapshot;
    /**
     * 입양 승인이 확정된 시각.
     * approvedAt(신규 필드, 추후 상태 전이 use-case 가 set) → updatedAt(자동 timestamp, 기존 데이터 fallback) → appliedAt 순.
     */
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

/**
 * 상세 화면에서 "내가 이 펫에 이미 신청했는지" 를 알려주는 스냅샷.
 * 재신청을 막는 신청(REAPPLICATION_BLOCKING_STATUSES)만 대상이며, 거절된 신청은 재신청을 막지 않으므로 제외된다.
 */
export interface MyPetApplicationSnapshot {
    applicationId: string;
    status: ReapplicationBlockingStatus;
}

export interface AdoptionRecordReaderPort {
    listMyAdopted(query: ListMyAdoptedQuery): Promise<ListMyAdoptedResult>;

    /**
     * 입양자가 해당 펫에 낸 신청 중 재신청을 막는 것 하나를 반환한다 (여러 건이면 appliedAt 최신).
     * 없으면 null. 판정 기준은 v2 신청 생성의 existsOpenApplicationForPet 과 같은 상수를 쓴다.
     */
    findMyBlockingApplicationForPet(adopterId: string, petId: string): Promise<MyPetApplicationSnapshot | null>;
}
