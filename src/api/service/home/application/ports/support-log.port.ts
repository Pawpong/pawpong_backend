export const SUPPORT_LOG_PORT = Symbol('SUPPORT_LOG_PORT');
export type SupportEvent = {
    eventId: string;
    kind: 'feedback' | 'ai_no_match' | 'ai_error';
    userType: string;
    message?: string;
    durationMs?: number;
    sourceIds?: string[];
};
export interface SupportLogPort {
    record(event: SupportEvent): Promise<void>;
}
