import { BadRequestException } from '@nestjs/common';

import { CommunityPostWriteValidatorService } from '../../../domain/services/community-post-write-validator.service';

describe('CommunityPostWriteValidatorService', () => {
    const validator = new CommunityPostWriteValidatorService();

    describe('create', () => {
        const validBase = () => ({
            authorId: 'a-1',
            authorModel: 'Adopter' as const,
            body: '본문 텍스트',
            photos: [],
        });

        it('body 가 공백만이면 BadRequest', () => {
            expect(() => validator.validateCreate({ ...validBase(), body: '   ' })).toThrow(BadRequestException);
        });
        it('body 가 2001자면 BadRequest', () => {
            expect(() => validator.validateCreate({ ...validBase(), body: 'A'.repeat(2001) })).toThrow(
                BadRequestException,
            );
        });
        it('photos 11장이면 BadRequest', () => {
            expect(() =>
                validator.validateCreate({ ...validBase(), photos: Array.from({ length: 11 }, () => 'p.jpg') }),
            ).toThrow(BadRequestException);
        });
        it('title 101자면 BadRequest', () => {
            expect(() => validator.validateCreate({ ...validBase(), title: 'A'.repeat(101) })).toThrow(
                BadRequestException,
            );
        });
        it('category 51자면 BadRequest', () => {
            expect(() => validator.validateCreate({ ...validBase(), category: 'A'.repeat(51) })).toThrow(
                BadRequestException,
            );
        });
        it('정상은 통과', () => {
            expect(() => validator.validateCreate(validBase())).not.toThrow();
        });
    });

    describe('update', () => {
        it('빈 patch 면 BadRequest', () => {
            expect(() => validator.validateUpdate({})).toThrow(BadRequestException);
        });
        it('body 를 빈 문자열로 수정 시도 → BadRequest', () => {
            expect(() => validator.validateUpdate({ body: '   ' })).toThrow(BadRequestException);
        });
        it('body 2001 자 → BadRequest', () => {
            expect(() => validator.validateUpdate({ body: 'A'.repeat(2001) })).toThrow(BadRequestException);
        });
        it('title 또는 category 만 바꾸는 것은 허용', () => {
            expect(() => validator.validateUpdate({ title: '새 제목' })).not.toThrow();
            expect(() => validator.validateUpdate({ category: '레오파드' })).not.toThrow();
        });
    });
});
