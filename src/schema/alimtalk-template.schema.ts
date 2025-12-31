import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AlimtalkTemplateDocument = AlimtalkTemplate & Document;

/**
 * 알림톡 버튼 타입
 */
export type AlimtalkButtonType = 'WL' | 'AL' | 'BK' | 'MD' | 'DS' | 'BC' | 'BT' | 'AC';

/**
 * 알림톡 버튼 정보 인터페이스
 */
export interface AlimtalkButton {
    /** 버튼 타입 (WL: 웹링크, AL: 앱링크, BK: 봇키워드, MD: 메시지전달 등) */
    buttonType: AlimtalkButtonType;
    /** 버튼명 */
    buttonName: string;
    /** 모바일 웹링크 URL (WL 타입) */
    linkMo?: string;
    /** PC 웹링크 URL (WL 타입) */
    linkPc?: string;
    /** 앱링크 스킴 (AL 타입) - Android */
    linkAnd?: string;
    /** 앱링크 스킴 (AL 타입) - iOS */
    linkIos?: string;
}

/**
 * 카카오 알림톡 템플릿 스키마
 *
 * @description
 * 솔라피에 등록된 카카오 알림톡 템플릿 정보를 MongoDB에 저장하여 관리합니다.
 * 코드 수정 없이 어드민에서 템플릿 ID를 변경할 수 있습니다.
 */
@Schema({
    timestamps: true,
    collection: 'alimtalk_templates',
})
export class AlimtalkTemplate {
    @ApiProperty({
        description: '템플릿 코드 (고유 식별자)',
        example: 'VERIFICATION_CODE',
    })
    @Prop({ required: true, unique: true })
    templateCode: string;

    @ApiProperty({
        description: '솔라피 템플릿 ID',
        example: 'KA01TP251221145150608gmUJUCLiOfs',
    })
    @Prop({ required: true })
    templateId: string;

    @ApiProperty({
        description: '템플릿 이름',
        example: '회원가입 인증번호',
    })
    @Prop({ required: true })
    name: string;

    @ApiProperty({
        description: '템플릿 설명',
        example: '회원가입 시 전화번호 인증을 위한 인증번호 발송',
    })
    @Prop()
    description?: string;

    @ApiProperty({
        description: '필수 변수 목록',
        example: ['code'],
        type: [String],
    })
    @Prop({ type: [String], default: [] })
    requiredVariables: string[];

    @ApiProperty({
        description: '알림톡 실패 시 SMS 대체 발송 여부',
        example: true,
    })
    @Prop({ default: true })
    fallbackToSms: boolean;

    @ApiProperty({
        description: '템플릿 활성화 여부',
        example: true,
    })
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty({
        description: '카카오 검수 상태',
        example: 'approved',
        enum: ['pending', 'approved', 'rejected', 're_review'],
    })
    @Prop({
        type: String,
        enum: ['pending', 'approved', 'rejected', 're_review'],
        default: 'approved',
    })
    reviewStatus: string;

    @ApiProperty({
        description: '메모 (관리자용)',
        example: '2025-12-22 검수 통과',
    })
    @Prop()
    memo?: string;

    @ApiProperty({
        description: '알림톡 버튼 목록 (최대 5개)',
        example: [
            {
                buttonType: 'WL',
                buttonName: '후기 작성하기',
                linkMo: 'https://pawpong.kr/application',
                linkPc: 'https://pawpong.kr/application',
            },
        ],
        type: 'array',
    })
    @Prop({ type: [Object], default: [] })
    buttons: AlimtalkButton[];
}

export const AlimtalkTemplateSchema = SchemaFactory.createForClass(AlimtalkTemplate);

// 인덱스 설정 (templateCode는 unique: true로 이미 인덱스됨)
AlimtalkTemplateSchema.index({ isActive: 1 });
