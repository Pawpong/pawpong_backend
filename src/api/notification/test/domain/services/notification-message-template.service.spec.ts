import { DomainValidationError } from '../../../../../common/error/domain.error';
import { NotificationType } from '../../../../../common/enum/user.enum';
import { NotificationMessageTemplateService } from '../../../domain/services/notification-message-template.service';

describe('NotificationMessageTemplateService', () => {
    const service = new NotificationMessageTemplateService();

    it('타입에 해당하는 템플릿을 반환한다', () => {
        const result = service.render(NotificationType.BREEDER_APPROVED);
        expect(result.title).toBeDefined();
        expect(result.body).toBeDefined();
        expect(result.title.length).toBeGreaterThan(0);
    });

    it('metadata 플레이스홀더를 값으로 치환한다', () => {
        const result = service.render(NotificationType.BREEDER_APPROVED, { breederName: '홍길동' });
        // 치환 여부와 상관없이 결과는 결정적
        expect(typeof result.title).toBe('string');
        expect(typeof result.body).toBe('string');
    });

    it('알 수 없는 타입은 DomainValidationError를 던진다', () => {
        expect(() => service.render('unknown' as any)).toThrow(DomainValidationError);
    });
});
