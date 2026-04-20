export const BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT = Symbol('BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT');

export interface BreederVerificationAdminFileUrlPort {
    generateOne(fileName: string, expirationMinutes?: number): string;
}
