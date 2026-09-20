export const BREEDER_MANAGEMENT_FILE_URL_PORT = Symbol('BREEDER_MANAGEMENT_FILE_URL_PORT');

export interface BreederManagementFileUrlPort {
    generateOne(fileName: string, expirationMinutes?: number): string;
    generateOneSafe(fileName: string | null | undefined, expirationMinutes?: number): string | undefined;
    generateMany(fileNames: string[], expirationMinutes?: number): string[];
    /** 화면에서 되돌아온 URL 을 저장용 파일키로 정규화한다 */
    toFileKey(value: string): string;
}
