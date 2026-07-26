import { BadRequestException } from '@nestjs/common';

import { AuthV2TermsAgreementValidatorService } from '../../../domain/services/auth-v2-terms-agreement-validator.service';

const ACTIVE = [
    {
        id: '1',
        code: 'service' as const,
        version: 'v1.0',
        title: '서비스 이용약관',
        body: '...',
        isRequired: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        code: 'privacy' as const,
        version: 'v1.0',
        title: '개인정보',
        body: '...',
        isRequired: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '3',
        code: 'marketing' as const,
        version: 'v1.0',
        title: '마케팅',
        body: '...',
        isRequired: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe('v2 약관 동의 검증 서비스', () => {
    const service = new AuthV2TermsAgreementValidatorService();

    it('필수 약관이 모두 포함되면 검증 통과 + 동의시각은 서버 시각으로 채운다', () => {
        const result = service.validate(ACTIVE, [
            { code: 'service', version: 'v1.0' },
            { code: 'privacy', version: 'v1.0' },
        ]);

        expect(result).toHaveLength(2);
        expect(result[0].agreedAt).toBeInstanceOf(Date);
    });

    it('필수 약관이 누락되면 BadRequestException', () => {
        expect(() => service.validate(ACTIVE, [{ code: 'service', version: 'v1.0' }])).toThrow(BadRequestException);
    });

    it('버전이 활성 버전과 다르면 BadRequestException', () => {
        expect(() =>
            service.validate(ACTIVE, [
                { code: 'service', version: 'v0.9' },
                { code: 'privacy', version: 'v1.0' },
            ]),
        ).toThrow(/버전이 일치하지 않습니다/);
    });

    it('활성 목록에 없는 약관 코드를 보내면 BadRequestException', () => {
        expect(() =>
            service.validate(ACTIVE, [
                { code: 'service', version: 'v1.0' },
                { code: 'privacy', version: 'v1.0' },
                { code: 'unknown_code', version: 'v1.0' },
            ]),
        ).toThrow(/알 수 없거나 비활성화된 약관입니다/);
    });

    it('활성 약관이 비어있으면 BadRequestException', () => {
        expect(() => service.validate([], [{ code: 'service', version: 'v1.0' }])).toThrow(
            /등록된 활성 약관이 없습니다/,
        );
    });

    it('클라이언트가 보낸 agreedAt 은 무시되고 서버 시각으로 덮어쓴다', () => {
        const clientTime = '2000-01-01T00:00:00.000Z';
        const result = service.validate(ACTIVE, [
            { code: 'service', version: 'v1.0', agreedAt: clientTime },
            { code: 'privacy', version: 'v1.0', agreedAt: clientTime },
        ]);

        for (const item of result) {
            expect(item.agreedAt.toISOString()).not.toBe(clientTime);
        }
    });
});
