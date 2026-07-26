export const ADOPTER_FILE_URL_PORT = Symbol('ADOPTER_FILE_URL_PORT');

export interface AdopterFileUrlPort {
    generateOneSafe(fileName: string | null | undefined, expirationMinutes?: number): string | undefined;
    generateMany(fileNames: string[], expirationMinutes?: number): string[];
}
