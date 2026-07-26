import { Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';
import type { FollowUserCardResult } from '../types/profile-result.type';

export interface FollowUsersPage {
    items: FollowUserCardResult[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * GET /v2/profile/users/:userId/followers — 친구 목록 모달 "팔로워" 탭.
 * viewerId(로그인 사용자)가 있으면 각 항목의 팔로우/맞팔 상태를 채운다.
 */
@Injectable()
export class GetUserFollowersUseCase {
    constructor(
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(userId: string, page = 1, pageSize = 20, viewerId?: string): Promise<FollowUsersPage> {
        const result = await this.follow.listFollowers(userId, { page, pageSize }, viewerId);
        return toFollowUsersPage(result, this.mapper, page, pageSize);
    }
}

/** 팔로워/팔로잉 목록 공통 페이지 조립 */
export function toFollowUsersPage(
    result: { items: Parameters<ProfileMapperService['toFollowUserCardDto']>[0][]; totalItems: number },
    mapper: ProfileMapperService,
    page: number,
    pageSize: number,
): FollowUsersPage {
    const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize));
    return {
        items: result.items.map((snapshot) => mapper.toFollowUserCardDto(snapshot)),
        pagination: {
            currentPage: page,
            pageSize,
            totalItems: result.totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
