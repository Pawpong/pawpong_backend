import { ApplicationStatus } from '../../../../../common/enum/user.enum';

export const BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT = Symbol('BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT');

export interface BreederManagementApplicationRecord {
    _id: { toString(): string };
    adopterId: { toString(): string };
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    petId?: { toString(): string } | null;
    petName?: string;
    status: string;
    standardResponses: Record<string, unknown>;
    customResponses?: unknown[];
    appliedAt: Date;
    processedAt?: Date;
    breederNotes?: string;
}

export interface BreederManagementApplicationStatusNotificationCommand {
    breederId: string;
    adopterId: string;
    applicationId: string;
    status: ApplicationStatus;
}

export interface BreederManagementApplicationChatRoomCommand {
    breederId: string;
    adopterId: string;
    applicationId: string;
}

export interface BreederManagementApplicationWorkflowPort {
    findApplicationByIdAndBreeder(
        applicationId: string,
        breederId: string,
    ): Promise<BreederManagementApplicationRecord | null>;
    updateStatus(applicationId: string, status: ApplicationStatus): Promise<void>;
    incrementCompletedAdoptions(breederId: string): Promise<void>;
    notifyApplicationStatusChanged(command: BreederManagementApplicationStatusNotificationCommand): Promise<void>;

    /**
     * 입양 확정 시각을 신청서에 기록한다. (adoption_approved 전이와 같은 시각을 쓴다)
     */
    recordApplicationApproval(applicationId: string, approvedAt: Date): Promise<void>;

    /**
     * 확정된 신청의 펫을 분양완료(adopted)로 전이하고 완료 시각을 기록한다.
     */
    markPetAsAdopted(petId: string, adoptedAt: Date): Promise<void>;

    /**
     * 같은 펫의 다른 처리 중(consultation_pending/consultation_completed) 신청을 일괄 거절한다.
     * 확정된 본인 신청은 제외하며, 거절 처리된 건수를 반환한다.
     */
    rejectOtherOpenApplicationsForPet(petId: string, approvedApplicationId: string): Promise<number>;

    /**
     * 펫의 예약 상태를 신청서에서 다시 계산해 맞춘다.
     * 상담완료 신청이 하나라도 남아 있으면 예약중, 하나도 없으면 분양중으로 되돌린다.
     * 분양완료(adopted)된 펫은 건드리지 않는다.
     *
     * 전이를 직접 지시하지 않고 매번 다시 계산하는 이유: 예약을 거는 길만 있고 푸는 길이 없으면
     * 마지막 상담완료 신청이 거절된 뒤 펫이 영영 잠긴다. 한 펫에 상담완료가 여러 건일 수도 있어
     * "거절했으니 무조건 해제" 도 틀린다.
     *
     * @returns 계산 결과 상태, 실제 변경이 없었으면 'unchanged'
     */
    syncPetReservationFromApplications(petId: string): Promise<'reserved' | 'available' | 'unchanged'>;

    /**
     * 확정된 신청의 입양자-브리더 채팅방을 보장한다. 이미 방이 있으면 새로 만들지 않는다(멱등).
     * 채팅방 생성 실패가 입양 확정 자체를 되돌리면 안 되므로 구현체는 예외를 던지지 않는다.
     */
    ensureChatRoomForApplication(command: BreederManagementApplicationChatRoomCommand): Promise<void>;
}
