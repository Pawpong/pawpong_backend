import { BadRequestException } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../pipe/mongo-object-id.pipe';

describe('MongoObjectIdPipe', () => {
    it('올바른 ObjectId 문자열은 그대로 반환한다', () => {
        const pipe = new MongoObjectIdPipe('공지사항');

        expect(pipe.transform('000000000000000000000000')).toBe('000000000000000000000000');
    });

    it('올바르지 않은 ObjectId 문자열이면 예외를 던진다', () => {
        const pipe = new MongoObjectIdPipe('영상');

        expect(() => pipe.transform('not-a-mongo-id')).toThrow(BadRequestException);
        expect(() => pipe.transform('not-a-mongo-id')).toThrow('영상 ID 형식이 올바르지 않습니다.');
    });
});
