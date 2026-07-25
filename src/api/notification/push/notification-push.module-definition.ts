import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { AdopterRepository } from '../../adopter/repository/adopter.repository';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';

import { NotificationPushTokenController } from '../controller/notification-push-token.controller';
import { RegisterPushDeviceTokenUseCase } from '../application/use-cases/register-push-device-token.use-case';
import { UnregisterPushDeviceTokenUseCase } from '../application/use-cases/unregister-push-device-token.use-case';
import { SendNotificationPushUseCase } from '../application/use-cases/send-notification-push.use-case';
import { NotificationFirebasePushAdapter } from '../infrastructure/notification-firebase-push.adapter';
import { NotificationPushTokenMongooseAdapter } from '../infrastructure/notification-push-token-mongoose.adapter';
import { NOTIFICATION_PUSH_PORT } from '../application/ports/notification-push.port';
import { NOTIFICATION_PUSH_TOKEN_STORE_PORT } from '../application/ports/notification-push-token-store.port';

// 알림 > 푸시 슬라이스 (FCM 발송 + 디바이스 토큰 등록/해제)
//
// 토큰은 입양자/브리더 도큐먼트의 pushDeviceTokens 배열에 저장되므로 두 repository 가 필요하다.
// AdopterModule/BreederManagementModule 을 import 하면 이들이 다시 NotificationModule 을
// import 해 순환이 생기므로, repository 만 이 슬라이스에 직접 등록한다.
const NOTIFICATION_PUSH_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const NOTIFICATION_PUSH_MODULE_IMPORTS = [NOTIFICATION_PUSH_SCHEMA_IMPORTS];

export const NOTIFICATION_PUSH_MODULE_CONTROLLERS = [NotificationPushTokenController];

export const NOTIFICATION_PUSH_MODULE_PROVIDERS = [
    RegisterPushDeviceTokenUseCase,
    UnregisterPushDeviceTokenUseCase,
    SendNotificationPushUseCase,
    AdopterRepository,
    BreederRepository,
    NotificationFirebasePushAdapter,
    NotificationPushTokenMongooseAdapter,
    {
        provide: NOTIFICATION_PUSH_PORT,
        useExisting: NotificationFirebasePushAdapter,
    },
    {
        provide: NOTIFICATION_PUSH_TOKEN_STORE_PORT,
        useExisting: NotificationPushTokenMongooseAdapter,
    },
];

export const NOTIFICATION_PUSH_MODULE_EXPORTS = [
    // dispatch 가 도메인 이벤트 알림과 함께 푸시를 보낼 때 사용
    SendNotificationPushUseCase,
    // 어드민 푸시 발송 모듈이 직접 소비
    NOTIFICATION_PUSH_PORT,
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
];
