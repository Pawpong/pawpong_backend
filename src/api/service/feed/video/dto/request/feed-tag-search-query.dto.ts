import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { FeedPaginationQueryDto } from './feed-pagination-query.dto';

export class FeedTagSearchQueryDto extends FeedPaginationQueryDto {
    /**
     * 검색할 해시태그.
     *
     * @Allow() 만 걸려 있어 미지정 요청이 검증을 통과했고, 유스케이스가 undefined 에
     * .trim() 을 호출해 400 이어야 할 요청이 500 으로 나가고 있었다.
     */
    @ApiProperty({ description: '검색할 해시태그', example: '강아지' })
    @IsString()
    @IsNotEmpty({ message: 'tag 파라미터는 필수입니다.' })
    @MaxLength(50)
    tag: string;
}
