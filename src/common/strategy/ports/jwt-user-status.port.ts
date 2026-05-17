export const JWT_USER_STATUS_PORT = Symbol('JWT_USER_STATUS_PORT');

export interface JwtUserStatusPort {
    findAccountStatus(userId: string, role: 'adopter' | 'breeder'): Promise<string | undefined>;
}
