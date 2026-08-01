import type { AdopterReportPayloadRecord } from '../../types/adopter-report.type';

export const ADOPTER_REPORT_COMMAND_PORT = Symbol('ADOPTER_REPORT_COMMAND_PORT');

export interface AdopterReportCommandPort {
    addReport(breederId: string, reportData: AdopterReportPayloadRecord): Promise<void>;
}
