import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhoneWhitelistDocument = PhoneWhitelist & Document;

/**
 * 전화번호 화이트리스트 스키마
 * 중복 가입이 허용되는 전화번호를 관리합니다.
 * 관리자/테스트 계정 등 특수 목적으로 사용됩니다.
 */
@Schema({
    timestamps: true,
    collection: 'phone_whitelist',
})
export class PhoneWhitelist {
    /**
     * 전화번호 (하이픈 없이 저장)
     * @example "01012345678"
     */
    @Prop({ required: true, unique: true })
    phoneNumber: string;

    /**
     * 설명 (어떤 목적으로 화이트리스트에 추가했는지)
     * @example "관리자 테스트 계정"
     */
    @Prop({ required: true })
    description: string;

    /**
     * 활성 상태 (비활성화하면 화이트리스트에서 제외)
     */
    @Prop({ default: true })
    isActive: boolean;

    /**
     * 등록한 관리자 ID
     */
    @Prop()
    createdBy?: string;

    /**
     * 생성일시 (timestamps로 자동 생성)
     */
    createdAt?: Date;

    /**
     * 수정일시 (timestamps로 자동 생성)
     */
    updatedAt?: Date;
}

export const PhoneWhitelistSchema = SchemaFactory.createForClass(PhoneWhitelist);

// 전화번호 유니크 인덱스
PhoneWhitelistSchema.index({ phoneNumber: 1 }, { unique: true });

// 활성 상태별 조회 인덱스
PhoneWhitelistSchema.index({ isActive: 1 });
