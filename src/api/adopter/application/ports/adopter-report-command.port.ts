export abstract class AdopterReportCommandPort {
    abstract addReport(breederId: string, reportData: any): Promise<void>;
}
