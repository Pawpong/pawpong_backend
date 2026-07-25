import { NotificationPushTokenMongooseAdapter } from '../../infrastructure/notification-push-token-mongoose.adapter';
import type { AdopterRepository } from '../../../adopter/repository/adopter.repository';
import type { BreederRepository } from '../../../breeder-management/repository/breeder.repository';
import type { RegisterPushDeviceTokenCommand } from '../../application/ports/notification-push-token-store.port';

describe('푸시 토큰 스토어 어댑터 - 기기 핸드오프', () => {
    let adopterRepository: jest.Mocked<
        Pick<AdopterRepository, 'upsertPushDeviceToken' | 'removePushDeviceTokenFromAllUsers'>
    >;
    let breederRepository: jest.Mocked<
        Pick<BreederRepository, 'upsertPushDeviceToken' | 'removePushDeviceTokenFromAllUsers'>
    >;
    let adapter: NotificationPushTokenMongooseAdapter;

    const command: RegisterPushDeviceTokenCommand = {
        userId: 'adopter-1',
        userRole: 'adopter',
        token: 'fcm-token-handoff-test',
        platform: 'android',
        appVersion: '1.0.0',
    };

    beforeEach(() => {
        adopterRepository = {
            upsertPushDeviceToken: jest.fn().mockResolvedValue(undefined),
            removePushDeviceTokenFromAllUsers: jest.fn().mockResolvedValue(undefined),
        };
        breederRepository = {
            upsertPushDeviceToken: jest.fn().mockResolvedValue(undefined),
            removePushDeviceTokenFromAllUsers: jest.fn().mockResolvedValue(undefined),
        };
        adapter = new NotificationPushTokenMongooseAdapter(
            adopterRepository as unknown as AdopterRepository,
            breederRepository as unknown as BreederRepository,
        );
    });

    it('등록 시 adopter/breeder 전체에서 동일 토큰을 먼저 제거한다', async () => {
        await adapter.register(command);

        expect(adopterRepository.removePushDeviceTokenFromAllUsers).toHaveBeenCalledWith(command.token);
        expect(breederRepository.removePushDeviceTokenFromAllUsers).toHaveBeenCalledWith(command.token);
    });

    it('전역 제거 후 현재 유저(adopter)에 토큰을 upsert 한다', async () => {
        await adapter.register(command);

        expect(adopterRepository.upsertPushDeviceToken).toHaveBeenCalledWith(
            command.userId,
            command.token,
            command.platform,
            command.appVersion,
        );
        expect(breederRepository.upsertPushDeviceToken).not.toHaveBeenCalled();
    });

    it('breeder 역할이면 breeder 에 upsert 한다 (전역 제거는 동일)', async () => {
        await adapter.register({ ...command, userRole: 'breeder', userId: 'breeder-1' });

        expect(adopterRepository.removePushDeviceTokenFromAllUsers).toHaveBeenCalledWith(command.token);
        expect(breederRepository.removePushDeviceTokenFromAllUsers).toHaveBeenCalledWith(command.token);
        expect(breederRepository.upsertPushDeviceToken).toHaveBeenCalledWith(
            'breeder-1',
            command.token,
            command.platform,
            command.appVersion,
        );
        expect(adopterRepository.upsertPushDeviceToken).not.toHaveBeenCalled();
    });
});
