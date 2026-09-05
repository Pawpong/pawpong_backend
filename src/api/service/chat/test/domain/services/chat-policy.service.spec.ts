import {
    DomainAuthorizationError,
    DomainNotFoundError,
    DomainValidationError,
} from '../../../../../../common/error/domain.error';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../../../common/enum/user.enum';

const baseRoom = {
    id: 'room-1',
    participantIds: ['a-1', 'b-1'],
    participants: [
        { userId: 'a-1', role: SenderRole.ADOPTER },
        { userId: 'b-1', role: SenderRole.BREEDER },
    ],
    participantKey: 'a-1:b-1',
    participantStates: [{ userId: 'a-1' }, { userId: 'b-1' }],
    applicationIds: [],
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

describe('ChatPolicyService', () => {
    const policy = new ChatPolicyService();

    it('방이 없으면 DomainNotFoundError', () => {
        expect(() => policy.requireRoom(null)).toThrow(DomainNotFoundError);
    });

    it('역할과 무관하게 participantIds에 든 사용자는 참여자다', () => {
        expect(policy.requireParticipant(baseRoom, 'a-1')).toEqual({ userId: 'a-1', role: SenderRole.ADOPTER });
        expect(() => policy.requireParticipant(baseRoom, 'other')).toThrow(DomainAuthorizationError);
    });

    it('발신자가 아닌 나머지 한 명을 수신자로 결정한다', () => {
        expect(policy.resolveReceiver(baseRoom, 'a-1')).toEqual({ userId: 'b-1', role: SenderRole.BREEDER });
        expect(policy.resolveReceiver(baseRoom, 'b-1')).toEqual({ userId: 'a-1', role: SenderRole.ADOPTER });
    });

    it('자기 자신과의 DM을 거부한다', () => {
        expect(() => policy.requireDifferentUsers('same', 'same')).toThrow(DomainValidationError);
    });

    it.each([UserStatus.SUSPENDED, UserStatus.DELETED])('%s 계정은 송신/재활성화를 거부한다', (accountStatus) => {
        expect(() =>
            policy.requireActive({
                userId: 'u-1',
                role: SenderRole.ADOPTER,
                nickname: '사용자',
                accountStatus,
            }),
        ).toThrow(DomainAuthorizationError);
    });
});
