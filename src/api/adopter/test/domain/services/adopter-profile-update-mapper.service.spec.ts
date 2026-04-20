import { AdopterProfileUpdateMapperService } from '../../../domain/services/adopter-profile-update-mapper.service';

describe('AdopterProfileUpdateMapperService', () => {
    const service = new AdopterProfileUpdateMapperService();

    it('모든 필드가 있으면 전부 매핑한다', () => {
        const result = service.toRecord({
            name: '홍길동',
            phone: '010-0',
            profileImage: 'img.png',
            marketingConsent: true,
        });
        expect(result).toEqual({
            fullName: '홍길동',
            phoneNumber: '010-0',
            profileImageFileName: 'img.png',
            marketingConsent: true,
        });
    });

    it('undefined 필드는 제외한다', () => {
        const result = service.toRecord({ name: '이름' });
        expect(result).toEqual({ fullName: '이름' });
    });

    it('빈 객체는 빈 객체를 반환한다', () => {
        expect(service.toRecord({})).toEqual({});
    });

    it('marketingConsent가 false여도 매핑된다', () => {
        const result = service.toRecord({ marketingConsent: false });
        expect(result.marketingConsent).toBe(false);
    });
});
