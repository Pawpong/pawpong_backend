import { ForbiddenException } from '@nestjs/common';

import { GetDeletedUserStatsUseCase } from './get-deleted-user-stats.use-case';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPaginationAssemblerService } from '../../domain/services/user-admin-pagination-assembler.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';
import { UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../ports/user-admin-writer.port';

describe('탈퇴 사용자 통계 조회 유스케이스', () => {
    it('탈퇴 통계를 응답 형태로 매핑한다', async () => {
        const reader: UserAdminReaderPort = {
            findAdminById: jest.fn().mockResolvedValue({
                id: 'admin-1',
                name: '관리자',
                email: 'admin@test.com',
                status: 'active',
                adminLevel: 'super_admin',
                permissions: { canManageUsers: true },
            }),
            getUsers: jest.fn(),
            findManagedUserById: jest.fn(),
            getDeletedUsers: jest.fn(),
            getDeletedUserStats: jest.fn().mockResolvedValue({
                totalDeletedAdopters: 2,
                totalDeletedBreeders: 1,
                adopterReasonStats: [{ reason: 'already_adopted', count: 2 }],
                breederReasonStats: [{ reason: 'no_inquiry', count: 1 }],
                otherReasonDetails: [{ userType: 'adopter', reason: '직접 입양함', deletedAt: '2026-04-06T00:00:00.000Z' }],
                last7DaysCount: 2,
                last30DaysCount: 3,
            }),
            listPhoneWhitelist: jest.fn(),
            findPhoneWhitelistById: jest.fn(),
            findPhoneWhitelistByPhoneNumber: jest.fn(),
        };
        const writer: UserAdminWriterPort = {
            updateManagedUser: jest.fn(),
            deleteManagedUser: jest.fn(),
            appendAdminActivityLog: jest.fn().mockResolvedValue(undefined),
            createPhoneWhitelist: jest.fn(),
            updatePhoneWhitelist: jest.fn(),
            deletePhoneWhitelist: jest.fn(),
        };
        const useCase = new GetDeletedUserStatsUseCase(
            reader,
            writer,
            new UserAdminCommandPolicyService(),
            new UserAdminActivityLogFactoryService(),
            new UserAdminPresentationService(new UserAdminPaginationAssemblerService()),
        );

        await expect(useCase.execute('admin-1')).resolves.toMatchObject({
            totalDeletedUsers: 3,
            totalDeletedAdopters: 2,
            totalDeletedBreeders: 1,
            adopterReasonStats: [{ reason: 'already_adopted', reasonLabel: '이미 입양을 마쳤어요', count: 2, percentage: 100 }],
            breederReasonStats: [{ reason: 'no_inquiry', reasonLabel: '입양 문의가 잘 오지 않았어요', count: 1, percentage: 100 }],
            last7DaysCount: 2,
            last30DaysCount: 3,
        });

        expect(writer.appendAdminActivityLog).toHaveBeenCalledWith(
            'admin-1',
            expect.objectContaining({
                action: 'view_statistics',
                targetType: 'system',
                targetId: 'deleted-users-stats',
            }),
        );
    });

    it('권한이 없으면 예외를 던진다', async () => {
        const useCase = new GetDeletedUserStatsUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    id: 'admin-1',
                    name: '관리자',
                    email: 'admin@test.com',
                    status: 'active',
                    adminLevel: 'super_admin',
                    permissions: { canManageUsers: false },
                }),
                getUsers: jest.fn(),
                findManagedUserById: jest.fn(),
                getDeletedUsers: jest.fn(),
                getDeletedUserStats: jest.fn(),
                listPhoneWhitelist: jest.fn(),
                findPhoneWhitelistById: jest.fn(),
                findPhoneWhitelistByPhoneNumber: jest.fn(),
            },
            {
                updateManagedUser: jest.fn(),
                deleteManagedUser: jest.fn(),
                appendAdminActivityLog: jest.fn(),
                createPhoneWhitelist: jest.fn(),
                updatePhoneWhitelist: jest.fn(),
                deletePhoneWhitelist: jest.fn(),
            },
            new UserAdminCommandPolicyService(),
            new UserAdminActivityLogFactoryService(),
            new UserAdminPresentationService(new UserAdminPaginationAssemblerService()),
        );

        await expect(useCase.execute('admin-1')).rejects.toBeInstanceOf(ForbiddenException);
    });
});
