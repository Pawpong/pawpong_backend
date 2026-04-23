import { Prop, Schema } from '@nestjs/mongoose';

/**
 * 푸시 알림 디바이스 토큰 스키마
 * 한 사용자가 여러 디바이스를 사용할 수 있어 배열로 관리합니다.
 */
@Schema({ _id: false })
export class PushDeviceToken {
    /**
     * FCM 발급 디바이스 토큰 (고유 식별자)
     */
    @Prop({ required: true })
    token: string;

    /**
     * 디바이스 플랫폼 (ios | android)
     */
    @Prop({ required: true, enum: ['ios', 'android'] })
    platform: string;

    /**
     * 토큰 등록/갱신 시각 (FCM은 주기적 갱신 필요)
     */
    @Prop({ default: Date.now })
    registeredAt: Date;

    /**
     * 앱 빌드 버전 (디버깅 용도)
     */
    @Prop()
    appVersion?: string;
}

/**
 * 소셜 인증 정보 스키마 (공통)
 * 사용자의 소셜 로그인 연동 정보를 저장합니다.
 */
@Schema({ _id: false })
export class SocialAuthInfo {
    /**
     * 인증 제공자 (local, google, kakao, naver, apple)
     */
    @Prop({ required: true, enum: ['local', 'google', 'kakao', 'naver', 'apple'] })
    authProvider: string;

    /**
     * 제공자 고유 ID
     */
    @Prop()
    providerUserId?: string;

    /**
     * 제공자에서 받은 이메일
     */
    @Prop()
    providerEmail?: string;
}

/**
 * User 베이스 스키마 (공통)
 * Adopter, Breeder, Admin이 상속받는 기본 사용자 정보
 */
@Schema()
export class User {
    /**
     * 이메일 주소 (로그인 ID)
     */
    @Prop({ required: true, lowercase: true })
    emailAddress: string;

    /**
     * 해시된 비밀번호 (소셜 로그인 사용자는 선택)
     */
    @Prop()
    passwordHash?: string;

    /**
     * 리프레시 토큰 (JWT 재발급용)
     */
    @Prop()
    refreshToken?: string;

    /**
     * 닉네임 (화면 표시용 이름)
     */
    @Prop({ required: true })
    nickname: string;

    /**
     * 연락처 전화번호
     */
    @Prop()
    phoneNumber?: string;

    /**
     * 프로필 이미지 파일 이름
     */
    @Prop()
    profileImageFileName?: string;

    /**
     * 소셜 인증 정보
     */
    @Prop({ type: SocialAuthInfo })
    socialAuthInfo?: SocialAuthInfo;

    /**
     * 사용자 역할 (adopter, breeder, admin)
     */
    @Prop({
        required: true,
        enum: ['adopter', 'breeder', 'admin'],
    })
    userRole: string;

    /**
     * 계정 상태 (active, suspended, deleted)
     */
    @Prop({
        default: 'active',
        enum: ['active', 'suspended', 'deleted'],
    })
    accountStatus: string;

    /**
     * 계정 정지 사유 (accountStatus가 suspended일 때만)
     */
    @Prop()
    suspensionReason?: string;

    /**
     * 계정 정지 일시 (accountStatus가 suspended일 때만)
     */
    @Prop()
    suspendedAt?: Date;

    /**
     * 회원 탈퇴 일시 (accountStatus가 deleted일 때)
     */
    @Prop()
    deletedAt?: Date;

    /**
     * 회원 탈퇴 사유 (accountStatus가 deleted일 때)
     * 입양자: already_adopted, no_suitable_pet, adoption_fee_burden, uncomfortable_ui, privacy_concern, other
     * 브리더: no_inquiry, time_consuming, verification_difficult, policy_mismatch, uncomfortable_ui, other
     */
    @Prop()
    deleteReason?: string;

    /**
     * 회원 탈퇴 상세 사유 (deleteReason이 other일 때)
     */
    @Prop()
    deleteReasonDetail?: string;

    /**
     * 마지막 로그인 일시
     */
    @Prop({ default: Date.now })
    lastLoginAt: Date;

    /**
     * 마지막 활동 일시 (API 호출 등)
     */
    @Prop({ default: Date.now })
    lastActivityAt: Date;

    /**
     * 서비스 이용약관 동의 여부 (필수)
     */
    @Prop({ required: true, default: false })
    termsAgreed: boolean;

    /**
     * 개인정보 처리방침 동의 여부 (필수)
     */
    @Prop({ required: true, default: false })
    privacyAgreed: boolean;

    /**
     * 마케팅 정보 수신 동의 여부 (선택)
     */
    @Prop({ default: false })
    marketingAgreed: boolean;

    /**
     * 푸시 알림 디바이스 토큰 목록 (FCM)
     * 한 사용자가 여러 기기에서 앱을 쓸 수 있으므로 배열로 관리.
     */
    @Prop({ type: [PushDeviceToken], default: [] })
    pushDeviceTokens: PushDeviceToken[];

    /**
     * 계정 생성 일시 (timestamps: true로 자동 생성)
     */
    createdAt?: Date;

    /**
     * 계정 수정 일시 (timestamps: true로 자동 생성)
     */
    updatedAt?: Date;
}
