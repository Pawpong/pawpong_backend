import type { CommunityAuthorSnapshot } from '../types/community-post-write.type';

export const COMMUNITY_AUTHOR_READER_PORT = Symbol('COMMUNITY_AUTHOR_READER_PORT');

export interface CommunityAuthorReaderPort {
    /**
     * 글 작성 시점의 작성자 닉네임/프로필 이미지 스냅샷을 가져온다.
     * adopter / breeder 컬렉션 중 role 에 맞는 곳에서 조회. 없으면 null.
     */
    readAuthorSnapshot(userId: string, role: 'adopter' | 'breeder'): Promise<CommunityAuthorSnapshot | null>;
}
