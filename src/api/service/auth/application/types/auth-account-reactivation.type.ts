import { type AuthSessionRole } from '../ports/auth-session.port';

export type AuthAccountReactivationResult = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    role: AuthSessionRole;
    userInfo: {
        userId: string;
        email: string;
        name: string;
        profileImage?: string;
    };
};
