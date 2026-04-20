import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../common/error/domain.error';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';

const baseRoom = {
    id: 'room-1',
    adopterId: 'adopter-1',
    breederId: 'breeder-1',
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
} as any;

describe('ChatPolicyService', () => {
    const policy = new ChatPolicyService();

    describe('requireRoom', () => {
        it('방이 있으면 그대로 반환', () => {
            expect(policy.requireRoom(baseRoom)).toBe(baseRoom);
        });
        it('null이면 DomainNotFoundError', () => {
            expect(() => policy.requireRoom(null)).toThrow(DomainNotFoundError);
        });
    });

    describe('requireParticipant', () => {
        it('adopter면 통과', () => {
            expect(() => policy.requireParticipant(baseRoom, 'adopter-1')).not.toThrow();
        });
        it('breeder면 통과', () => {
            expect(() => policy.requireParticipant(baseRoom, 'breeder-1')).not.toThrow();
        });
        it('참여자가 아니면 DomainAuthorizationError', () => {
            expect(() => policy.requireParticipant(baseRoom, 'other')).toThrow(DomainAuthorizationError);
        });
    });

    describe('resolveReceiverId', () => {
        it('adopter가 보내면 수신자는 breeder', () => {
            expect(policy.resolveReceiverId(baseRoom, 'adopter-1')).toBe('breeder-1');
        });
        it('breeder가 보내면 수신자는 adopter', () => {
            expect(policy.resolveReceiverId(baseRoom, 'breeder-1')).toBe('adopter-1');
        });
    });

    describe('ensureAdopterRole', () => {
        it('adopter면 통과', () => {
            expect(() => policy.ensureAdopterRole('adopter')).not.toThrow();
        });
        it('breeder면 DomainAuthorizationError', () => {
            expect(() => policy.ensureAdopterRole('breeder')).toThrow(DomainAuthorizationError);
        });
    });
});
