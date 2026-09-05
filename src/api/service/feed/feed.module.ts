import { Module } from '@nestjs/common';
import { FEED_MODULE_EXPORTS, FEED_MODULE_IMPORTS } from './feed.module-definition';

@Module({
    imports: FEED_MODULE_IMPORTS,
    exports: FEED_MODULE_EXPORTS,
})
export class FeedModule {}
