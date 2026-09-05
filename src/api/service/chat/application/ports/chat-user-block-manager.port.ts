export const CHAT_USER_BLOCK_MANAGER = Symbol('CHAT_USER_BLOCK_MANAGER');

export interface ChatUserBlockManagerPort {
    isBlockedBetween(firstUserId: string, secondUserId: string): Promise<boolean>;
    blockUser(blockerId: string, blockedUserId: string): Promise<void>;
    unblockUser(blockerId: string, blockedUserId: string): Promise<void>;
}
