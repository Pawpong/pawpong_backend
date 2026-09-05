import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { KafkaService, KafkaTopic } from '../../../../../common/kafka/kafka.service';
import type { AiImageGenerationPublisherPort } from '../application/ports/ai-image-generation-publisher.port';
import type { AiImageGenerationRequestedEvent } from '../application/types/ai-image-generation-command.type';

/**
 * 생성 요청 Kafka 발행.
 *
 * KafkaService.emit 은 브로커 미연결 시 경고만 남기고 조용히 반환한다.
 * 그대로 쓰면 작업이 영원히 대기 상태로 남으므로, 여기서 연결 상태를 먼저 확인하고
 * 사용 불가하면 예외를 던져 호출부가 작업을 즉시 실패 처리하도록 한다.
 */
@Injectable()
export class AiImageGenerationKafkaPublisherAdapter implements AiImageGenerationPublisherPort {
    constructor(private readonly kafkaService: KafkaService) {}

    async publishGenerationRequested(event: AiImageGenerationRequestedEvent): Promise<void> {
        if (!this.kafkaService.isKafkaConnected()) {
            throw new ServiceUnavailableException('AI 생성 대기열을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }

        await this.kafkaService.emit(KafkaTopic.AI_IMAGE_REQUEST, event);
    }
}
