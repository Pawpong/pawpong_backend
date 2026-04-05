export const AUTH_REGISTRATION_PORT = Symbol('AUTH_REGISTRATION_PORT');

export type AuthRegistrationRecord = Record<string, any>;

export interface AuthRegistrationPort {
    findAdopterByEmail(email: string): Promise<AuthRegistrationRecord | null>;
    findAdopterByNickname(nickname: string): Promise<AuthRegistrationRecord | null>;
    findAdopterBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null>;
    createAdopter(adopterData: Record<string, any>): Promise<AuthRegistrationRecord>;
    saveAdopterRefreshToken(userId: string, refreshTokenHash: string): Promise<void>;

    findBreederByEmail(email: string): Promise<AuthRegistrationRecord | null>;
    findBreederByName(breederName: string): Promise<AuthRegistrationRecord | null>;
    findBreederBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null>;
    createBreeder(breederData: Record<string, any>): Promise<AuthRegistrationRecord>;
    saveBreederRefreshToken(userId: string, refreshTokenHash: string): Promise<void>;
}
