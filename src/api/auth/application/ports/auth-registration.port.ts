import type { AuthRegistrationRecord } from '../../types/auth-record.type';

export abstract class AuthRegistrationPort {
    abstract findAdopterByEmail(email: string): Promise<AuthRegistrationRecord | null>;
    abstract findAdopterByNickname(nickname: string): Promise<AuthRegistrationRecord | null>;
    abstract findAdopterBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null>;
    abstract createAdopter(adopterData: Record<string, unknown>): Promise<AuthRegistrationRecord>;
    abstract saveAdopterRefreshToken(userId: string, refreshTokenHash: string): Promise<void>;

    abstract findBreederByEmail(email: string): Promise<AuthRegistrationRecord | null>;
    abstract findBreederByName(breederName: string): Promise<AuthRegistrationRecord | null>;
    abstract findBreederBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null>;
    abstract createBreeder(breederData: Record<string, unknown>): Promise<AuthRegistrationRecord>;
    abstract saveBreederRefreshToken(userId: string, refreshTokenHash: string): Promise<void>;
}
