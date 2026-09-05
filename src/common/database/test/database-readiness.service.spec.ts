import { Connection, ConnectionStates } from 'mongoose';

import { DatabaseReadinessService } from '../database-readiness.service';

describe('DatabaseReadinessService', () => {
    const createService = (readyState: ConnectionStates, ping: jest.Mock) => {
        const connection = {
            readyState,
            db:
                readyState === ConnectionStates.uninitialized
                    ? undefined
                    : {
                          admin: () => ({ ping }),
                      },
        } as unknown as Connection;

        return new DatabaseReadinessService(connection);
    };

    it('연결 상태가 connected가 아니면 ping 없이 unhealthy를 반환한다', async () => {
        const ping = jest.fn();
        const service = createService(ConnectionStates.disconnected, ping);

        await expect(service.check()).resolves.toEqual(
            expect.objectContaining({ status: 'unhealthy', connectionState: 'disconnected' }),
        );
        expect(ping).not.toHaveBeenCalled();
    });

    it('MongoDB ping 성공 시 latency를 포함한 healthy를 반환한다', async () => {
        const ping = jest.fn().mockResolvedValue({ ok: 1 });
        const service = createService(ConnectionStates.connected, ping);

        const result = await service.check();

        expect(result).toEqual(expect.objectContaining({ status: 'healthy', connectionState: 'connected' }));
        expect(result.latencyMs).toBeGreaterThanOrEqual(0);
        expect(ping).toHaveBeenCalledWith({ maxTimeMS: 2000 });
    });

    it('드라이버 상태가 connected여도 ping 실패 시 unhealthy를 반환한다', async () => {
        const ping = jest.fn().mockRejectedValue(new Error('server selection timeout'));
        const service = createService(ConnectionStates.connected, ping);

        await expect(service.check()).resolves.toEqual(
            expect.objectContaining({ status: 'unhealthy', connectionState: 'connected' }),
        );
    });
});
