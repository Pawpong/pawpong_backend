import { ManageProductionBackupUseCase } from '../../../application/use-cases/manage-production-backup.use-case';

describe('production backup authorization', () => {
    const backups = {
        request: jest.fn().mockResolvedValue({ jobId: '1' }),
        list: jest.fn().mockResolvedValue({ jobs: [] }),
    };
    beforeEach(() => jest.clearAllMocks());
    it.each([null, { permissions: { canViewStatistics: true } }])(
        'rejects non-backup admins before queue access',
        async (admin) => {
            const useCase = new ManageProductionBackupUseCase({ findAdminById: async () => admin } as any, backups);
            await expect(useCase.execute('admin', 'request')).rejects.toMatchObject({ statusCode: 403 });
            expect(backups.request).not.toHaveBeenCalled();
        },
    );
    it('allows an authorized operator and records actor identity', async () => {
        const useCase = new ManageProductionBackupUseCase(
            { findAdminById: async () => ({ permissions: { canManageAdmins: true } }) } as any,
            backups,
        );
        await expect(useCase.execute('admin', 'request')).resolves.toEqual({ jobId: '1' });
        expect(backups.request).toHaveBeenCalledWith('admin');
        await useCase.execute('admin', 'list');
        expect(backups.list).toHaveBeenCalledTimes(1);
    });
});
