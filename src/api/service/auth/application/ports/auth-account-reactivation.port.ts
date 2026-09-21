import { type AuthSessionRole } from './auth-session.port';

export type AuthReactivationAccount = {
    readonly userId: string;
    readonly email: string;
    readonly name: string;
    readonly role: AuthSessionRole;
    readonly accountStatus: string;
    readonly profileImage?: string;
};

export const AUTH_ACCOUNT_REACTIVATION_PORT = Symbol('AUTH_ACCOUNT_REACTIVATION_PORT');

export interface AuthAccountReactivationPort {
    findById(userId: string, role: AuthSessionRole): Promise<AuthReactivationAccount | null>;

    /** accountStatus 를 active 로 되돌리고 탈퇴 흔적(deletedAt/deleteReason)을 제거한다. */
    reactivate(userId: string, role: AuthSessionRole): Promise<void>;
}
