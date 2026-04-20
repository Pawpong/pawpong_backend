import { BreederBirthDateFormatterService } from '../../../domain/services/breeder-birth-date-formatter.service';

describe('BreederBirthDateFormatterService', () => {
    const service = new BreederBirthDateFormatterService();

    it('Date 객체를 한국어로 포매팅한다', () => {
        expect(service.formatToKorean(new Date('2024-05-03T00:00:00.000Z'))).toMatch(/\d{4}년 \d{2}월 \d{2}일 생/);
    });

    it('문자열도 처리한다', () => {
        expect(service.formatToKorean('2023-01-15')).toMatch(/2023년 01월 15일 생/);
    });

    it('undefined는 빈 문자열', () => {
        expect(service.formatToKorean(undefined)).toBe('');
    });

    it('잘못된 Date는 빈 문자열', () => {
        expect(service.formatToKorean('not-a-date')).toBe('');
    });
});
