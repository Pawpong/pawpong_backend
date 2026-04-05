export const BREEDER_FILE_URL_PORT = 'BREEDER_FILE_URL_PORT';

export interface BreederFileUrlPort {
    generateOne(fileName: string, expirationMinutes?: number): string;
    generateOneSafe(fileName: string | null | undefined, expirationMinutes?: number): string | undefined;
    generateMany(fileNames: string[], expirationMinutes?: number): string[];
}
