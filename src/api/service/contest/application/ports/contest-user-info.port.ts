export const CONTEST_USER_INFO_PORT = Symbol('CONTEST_USER_INFO_PORT');

export interface ContestUserInfoSnapshot {
    displayName: string;
    profileImageFileName: string | null;
}

export interface ContestUserInfoPort {
    readUserInfo(userId: string, role: 'adopter' | 'breeder'): Promise<ContestUserInfoSnapshot | null>;
}
