import { Injectable } from '@nestjs/common';

/**
 * 브로드캐스트용 Kafka consumer 의 준비 상태를 앱 전역에 공유한다.
 *
 * producer 는 부팅 직후 붙지만, consumer 는 브로커 준비가 늦으면
 * `KafkaStartupRetry` 재시도가 성공한 뒤에야 합류한다. 그 사이에 발행된 메시지는
 * 아무도 소비하지 않으므로 "발행 성공" 만 보고 로컬 브로드캐스트를 건너뛰면
 * 메시지가 DB 에만 남고 영구 유실된다. 발행 결과와 이 플래그를 함께 보고 폴백을 결정한다.
 */
@Injectable()
export class KafkaConsumerStatus {
    private ready = false;

    markReady(): void {
        this.ready = true;
    }

    markNotReady(): void {
        this.ready = false;
    }

    isReady(): boolean {
        return this.ready;
    }
}
