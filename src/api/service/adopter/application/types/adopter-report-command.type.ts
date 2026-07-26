export type AdopterReportCreateCommand = {
    type: string;
    breederId: string;
    reason: string;
    description?: string;
    evidence?: string[];
    contactInfo?: string;
};
