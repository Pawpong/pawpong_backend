import { BadRequestException } from '@nestjs/common';

import { AddPhoneWhitelistUseCase } from './add-phone-whitelist.use-case';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPhoneWhitelistPresentationService } from '../../domain/services/user-admin-phone-whitelist-presentation.service';
import { UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../ports/user-admin-writer.port';

describe('전화번호 화이트리스트 추가 유스케이스', () => {
    it('중복이 아니면 화이트리스트를 생성한다', async () => {
        const reader: UserAdminReaderPort = {
            findAdminById: jest.fn(),
            getUsers: jest.fn(),
            findManagedUserById: jest.fn(),
            getDeletedUsers: jest.fn(),
            getDeletedUserStats: jest.fn(),
            listPhoneWhitelist: jest.fn(),
            findPhoneWhitelistById: jest.fn(),
            findPhoneWhitelistByPhoneNumber: jest.fn().mockResolvedValue(null),
        };
        const writer: UserAdminWriterPort = {
            updateManagedUser: jest.fn(),
            deleteManagedUser: jest.fn(),
            appendAdminActivityLog: jest.fn(),
            createPhoneWhitelist: jest.fn().mockResolvedValue({
                id: 'wl-1',
                phoneNumber: '01012345678',
                description: '테스트 계정',
                isActive: true,
                createdBy: 'admin-1',
            }),
            updatePhoneWhitelist: jest.fn(),
            deletePhoneWhitelist: jest.fn(),
        };
        const useCase = new AddPhoneWhitelistUseCase(
            reader,
            writer,
            new UserAdminCommandPolicyService(),
            new UserAdminPhoneWhitelistPresentationService(),
        );

        await expect(
            useCase.execute('admin-1', {
                phoneNumber: '01012345678',
                description: '테스트 계정',
            }),
        ).resolves.toMatchObject({
            id: 'wl-1',
            phoneNumber: '01012345678',
            description: '테스트 계정',
        });
    });

    it('이미 존재하면 예외를 던진다', async () => {
        const useCase = new AddPhoneWhitelistUseCase(
            {
                findAdminById: jest.fn(),
                getUsers: jest.fn(),
                findManagedUserById: jest.fn(),
                getDeletedUsers: jest.fn(),
                getDeletedUserStats: jest.fn(),
                listPhoneWhitelist: jest.fn(),
                findPhoneWhitelistById: jest.fn(),
                findPhoneWhitelistByPhoneNumber: jest.fn().mockResolvedValue({
                    id: 'wl-1',
                    phoneNumber: '01012345678',
                    description: '테스트 계정',
                    isActive: true,
                }),
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
            new UserAdminPhoneWhitelistPresentationService(),
        );

        await expect(
            useCase.execute('admin-1', {
                phoneNumber: '01012345678',
                description: '테스트 계정',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
