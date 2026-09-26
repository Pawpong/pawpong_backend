import { Body, Controller, Get, HttpCode, Post, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { IsBoolean, IsIn, IsString } from 'class-validator';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CONTENT_RIGHTS_VERSION } from '../../../common/content-rights/app-request-context';

class ContentRightsConsentRequest {
    @IsString()
    @IsIn([CONTENT_RIGHTS_VERSION])
    version: string;

    @IsBoolean()
    accepted: boolean;
}

type ContentRightsAccount = {
    _id: Types.ObjectId;
    accountStatus: string;
    contentRightsConsentVersion?: string;
    contentRightsConsentedAt?: Date;
    contentRightsConsentHistory?: Array<{ version: string; consentedAt: Date }>;
};

@ApiTags('Content rights')
@Controller('v2/content-rights')
@UseGuards(JwtAuthGuard)
export class ContentRightsController {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    private accountCollection(role: string) {
        if (role !== 'adopter' && role !== 'breeder') throw new BadRequestException('지원하지 않는 계정 유형입니다.');
        return this.connection.db!.collection<ContentRightsAccount>(role === 'adopter' ? 'adopters' : 'breeders');
    }

    @Get('me')
    async status(@CurrentUser('userId') userId: string, @CurrentUser('role') role: string) {
        if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('계정을 찾을 수 없습니다.');
        const account = await this.accountCollection(role).findOne(
            { _id: new Types.ObjectId(userId), accountStatus: 'active' },
            { projection: { contentRightsConsentVersion: 1, contentRightsConsentedAt: 1 } },
        );
        if (!account) throw new NotFoundException('계정을 찾을 수 없습니다.');
        return ApiResponseDto.success({
            version: CONTENT_RIGHTS_VERSION,
            accepted: account.contentRightsConsentVersion === CONTENT_RIGHTS_VERSION,
            consentedAt: account.contentRightsConsentedAt ?? null,
        });
    }

    @Post('me')
    @HttpCode(200)
    async consent(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() body: ContentRightsConsentRequest,
    ) {
        if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('계정을 찾을 수 없습니다.');
        if (body.accepted !== true) throw new BadRequestException('명시적 동의가 필요합니다.');
        const now = new Date();
        const collection = this.accountCollection(role);
        const account = await collection.findOneAndUpdate(
            {
                _id: new Types.ObjectId(userId),
                accountStatus: 'active',
                contentRightsConsentVersion: { $ne: CONTENT_RIGHTS_VERSION },
            },
            {
                $set: { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION, contentRightsConsentedAt: now },
                $push: { contentRightsConsentHistory: { version: CONTENT_RIGHTS_VERSION, consentedAt: now } },
            },
            { returnDocument: 'after', projection: { contentRightsConsentedAt: 1 } },
        );
        const current = account ?? await collection.findOne(
            { _id: new Types.ObjectId(userId), accountStatus: 'active' },
            { projection: { contentRightsConsentVersion: 1, contentRightsConsentedAt: 1 } },
        );
        if (!current) throw new NotFoundException('계정을 찾을 수 없습니다.');
        return ApiResponseDto.success({
            version: CONTENT_RIGHTS_VERSION,
            accepted: current.contentRightsConsentVersion === CONTENT_RIGHTS_VERSION,
            consentedAt: current.contentRightsConsentedAt ?? now,
        });
    }
}
