export const SUPPORT_MANAGEMENT_PORT = Symbol('SUPPORT_MANAGEMENT_PORT');
export type SupportStatus = 'open' | 'in_progress' | 'resolved';
export type SupportUpdate = {
    revision: number;
    status: SupportStatus;
    assignment?: 'me' | 'unassigned';
    note?: string;
};
export interface SupportManagementPort {
    list(environment: string, page: number, status?: SupportStatus, receiptId?: string): Promise<unknown>;
    update(environment: string, eventId: string, actorId: string, command: SupportUpdate): Promise<unknown>;
}
