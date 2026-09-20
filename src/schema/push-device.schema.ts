import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 푸시 디바이스 스키마
 *
 * adopter/breeder 도큐먼트의 pushDeviceTokens 배열은 "계정이 가진 토큰"을 표현한다.
 * 이 컬렉션은 그 앞 단계인 "계정과 무관한 기기"를 표현한다 — 앱을 설치만 하고
 * 아직 로그인하지 않은 상태에서도 푸시를 보낼 수 있어야 하기 때문이다.
 *
 * 로그인하면 userId/userRole이 채워지고(바인딩), 로그아웃하면 다시 비워진다.
 * 기기 레코드 자체는 지우지 않는다 — 재로그인 시 같은 토큰을 다시 바인딩하면 된다.
 */
@Schema({ collection: 'push_device', timestamps: true })
export class PushDevice extends Document {
    /**
     * FCM 디바이스 등록 토큰. 기기 1대당 1건이므로 유니크.
     */
    @Prop({ required: true, unique: true, index: true })
    token: string;

    /**
     * 기기 플랫폼
     */
    @Prop({ type: String, enum: ['ios', 'android'] })
    platform?: string;

    /**
     * 등록 시점의 앱 버전 (강제 업데이트 대상 파악용)
     */
    @Prop()
    appVersion?: string;

    /**
     * 바인딩된 계정 ID. 로그인 전에는 null.
     */
    @Prop({ type: String, default: null, index: true })
    userId?: string | null;

    /**
     * 바인딩된 계정 역할. 로그인 전에는 null.
     */
    @Prop({ type: String, enum: ['adopter', 'breeder', null], default: null })
    userRole?: string | null;

    /**
     * 마지막으로 앱이 이 토큰을 보고한 시각. 오래된 기기 정리 기준.
     */
    @Prop({ required: true, default: Date.now })
    lastSeenAt: Date;

    /**
     * 설치 직후 안내 푸시를 이미 보냈는지. 앱을 켤 때마다 다시 보내지 않기 위한 플래그.
     */
    @Prop({ required: true, default: false })
    welcomeSent: boolean;
}

export const PushDeviceSchema = SchemaFactory.createForClass(PushDevice);
