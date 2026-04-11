export const BREEDER_MANAGEMENT_FILE_URL_PORT = Symbol('BREEDER_MANAGEMENT_FILE_URL_PORT');

export interface BreederManagementFileUrlPort {
    generateOne(fileName: string, expirationMinutes?: number): string;
    generateOneSafe(fileName: string | null | undefined, expirationMinutes?: number): string | undefined;
    generateMany(fileNames: string[], expirationMinutes?: number): string[];
}
