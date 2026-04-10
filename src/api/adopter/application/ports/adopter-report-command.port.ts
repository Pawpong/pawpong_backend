import type { AdopterReportPayloadRecord } from '../../types/adopter-report.type';

export abstract class AdopterReportCommandPort {
    abstract addReport(breederId: string, reportData: AdopterReportPayloadRecord): Promise<void>;
}
