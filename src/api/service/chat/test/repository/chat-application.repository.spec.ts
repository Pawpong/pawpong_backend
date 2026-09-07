import { ChatApplicationRepository } from '../../repository/chat-application.repository';

describe('신청서 채팅 참여자 검증', () => {
    const applicationId = '507f1f77bcf86cd799439011';
    const setup = (application: unknown) => {
        const exec = jest.fn().mockResolvedValue(application);
        const model = { findById: jest.fn().mockReturnValue({ select: () => ({ lean: () => ({ exec }) }) }) };
        return { model, repository: new ChatApplicationRepository(model as never) };
    };

    it.each([
        ['sender', 'receiver'],
        ['receiver', 'sender'],
    ])('두 당사자는 어느 방향에서도 연결 가능하다: %s %s', async (a, b) => {
        const { repository } = setup({ adopterId: 'sender', breederId: 'receiver' });
        expect(await repository.belongsToParticipants(applicationId, [a, b])).toBe(true);
    });

    it.each([null, { adopterId: 'someone-else', breederId: 'receiver' }, { breederId: 'receiver' }])(
        '존재하지 않거나 다른 사람의 신청서는 거부한다',
        async (application) => {
            const { repository } = setup(application);
            expect(await repository.belongsToParticipants(applicationId, ['sender', 'receiver'])).toBe(false);
        },
    );

    it('잘못된 ID는 DB 조회 전에 거부한다', async () => {
        const { repository, model } = setup(null);
        expect(await repository.belongsToParticipants('invalid', ['sender', 'receiver'])).toBe(false);
        expect(model.findById).not.toHaveBeenCalled();
    });
});
