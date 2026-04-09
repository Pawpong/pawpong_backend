import { BadRequestException } from '@nestjs/common';

import { UpdateUserStatusUseCase } from './update-user-status.use-case';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../ports/user-admin-writer.port';

describe('사용자 상태 수정 유스케이스', () => {
    it('상태를 변경하고 관리자 로그를 기록한다', async () => {
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
            findManagedUserById: jest.fn().mockResolvedValue({
                id: 'user-1',
                name: '브리더명',
                emailAddress: 'breeder@test.com',
                accountStatus: 'active',
            }),
            getDeletedUsers: jest.fn(),
            getDeletedUserStats: jest.fn(),
            listPhoneWhitelist: jest.fn(),
            findPhoneWhitelistById: jest.fn(),
            findPhoneWhitelistByPhoneNumber: jest.fn(),
        };
        const writer: UserAdminWriterPort = {
            updateManagedUser: jest.fn().mockResolvedValue({
                id: 'user-1',
                name: '브리더명',
                emailAddress: 'breeder@test.com',
                accountStatus: 'suspended',
            }),
            deleteManagedUser: jest.fn(),
            appendAdminActivityLog: jest.fn().mockResolvedValue(undefined),
            createPhoneWhitelist: jest.fn(),
            updatePhoneWhitelist: jest.fn(),
            deletePhoneWhitelist: jest.fn(),
        };
        const useCase = new UpdateUserStatusUseCase(
            reader,
            writer,
            new UserAdminCommandPolicyService(),
            new UserAdminActivityLogFactoryService(),
        );

        await expect(
            useCase.execute('admin-1', 'user-1', 'breeder', {
                accountStatus: 'suspended' as any,
                actionReason: '운영 정책 위반',
            }),
        ).resolves.toEqual({
            message: 'breeder status updated to suspended',
        });

        expect(writer.updateManagedUser).toHaveBeenCalledWith(
            'breeder',
            'user-1',
            expect.objectContaining({
                accountStatus: 'suspended',
                suspensionReason: '운영 정책 위반',
            }),
        );
        expect(writer.appendAdminActivityLog).toHaveBeenCalledWith(
            'admin-1',
            expect.objectContaining({
                action: 'suspend_user',
                targetType: 'breeder',
                targetId: 'user-1',
            }),
        );
    });

    it('대상 사용자가 없으면 예외를 던진다', async () => {
        const useCase = new UpdateUserStatusUseCase(
            {
                findAdminById: jest.fn().mockResolvedValue({
                    id: 'admin-1',
                    name: '관리자',
                    email: 'admin@test.com',
                    status: 'active',
                    adminLevel: 'super_admin',
                    permissions: { canManageUsers: true },
                }),
                getUsers: jest.fn(),
                findManagedUserById: jest.fn().mockResolvedValue(null),
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
        );

        await expect(
            useCase.execute('admin-1', 'missing', 'adopter', {
                accountStatus: 'active' as any,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
