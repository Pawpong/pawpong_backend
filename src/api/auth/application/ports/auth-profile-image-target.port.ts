export type AuthProfileImageOwnerRole = 'breeder' | 'adopter';

export const AUTH_PROFILE_IMAGE_TARGET_PORT = Symbol('AUTH_PROFILE_IMAGE_TARGET_PORT');

export interface AuthProfileImageTargetPort {
    save(userId: string, role: AuthProfileImageOwnerRole, fileName: string): Promise<void>;
}
