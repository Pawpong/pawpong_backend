export type AuthProfileImageOwnerRole = 'breeder' | 'adopter';

export abstract class AuthProfileImageTargetPort {
    abstract save(userId: string, role: AuthProfileImageOwnerRole, fileName: string): Promise<void>;
}
