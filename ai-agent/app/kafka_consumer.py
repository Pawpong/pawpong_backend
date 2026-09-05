"""ai-image.request.v1 구독 → 워크플로 실행 → ai-image.result.v1 발행.

NestJS 결과 컨슈머와의 계약(AiImageGenerationResultEvent):
  { id, jobId, status: 'succeeded'|'failed', outputObjectKey?, errorCode?, completedAt }

id 는 파티션 키로도 쓰이므로 jobId 와 동일하게 채운다.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from .config import settings
from .graph.workflow import AiImageWorkflow

logger = logging.getLogger(__name__)


class AiImageKafkaConsumer:
    def __init__(self, workflow: Optional[AiImageWorkflow] = None) -> None:
        self._workflow = workflow or AiImageWorkflow()
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._producer: Optional[AIOKafkaProducer] = None
        self._running = False
        self._in_flight = 0

    @property
    def in_flight(self) -> int:
        return self._in_flight

    @property
    def connected(self) -> bool:
        return self._running

    async def start(self) -> None:
        self._consumer = AIOKafkaConsumer(
            settings.request_topic,
            bootstrap_servers=settings.kafka_broker,
            group_id=settings.consumer_group,
            enable_auto_commit=False,
            auto_offset_reset="earliest",
            # 동시 처리 슬롯이 1이므로 한 번에 여러 건을 당겨와도 처리 시간이 길어져
            # 세션 타임아웃에 걸린다 → 1건씩만 가져온다
            max_poll_records=1,
        )
        self._producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_broker)
        await self._consumer.start()
        await self._producer.start()
        self._running = True
        logger.info("[kafka] 구독 시작: %s (group=%s)", settings.request_topic, settings.consumer_group)

    async def stop(self) -> None:
        self._running = False
        if self._consumer:
            await self._consumer.stop()
        if self._producer:
            await self._producer.stop()

    async def consume_forever(self) -> None:
        assert self._consumer is not None
        semaphore = asyncio.Semaphore(settings.concurrency)

        async for message in self._consumer:
            async with semaphore:
                try:
                    await self._handle(message.value)
                except Exception as error:  # noqa: BLE001
                    # 어떤 예외도 루프를 죽이지 않는다. 죽으면 오프셋이 멈춰 큐가 막힌다
                    logger.exception("[kafka] 메시지 처리 실패: %s", error)
                finally:
                    # 재처리해도 결과가 같으므로(NestJS 쪽 멱등 가드) 항상 커밋해 큐를 비운다
                    await self._consumer.commit()

    async def _handle(self, raw: bytes) -> None:
        event = self._parse(raw)
        if event is None:
            return

        job_id = event["jobId"]
        self._in_flight += 1
        try:
            result = await self._run_with_retry(event)
            await self._publish_result(job_id, result)
        finally:
            self._in_flight -= 1

    async def _run_with_retry(self, event: dict[str, Any]) -> dict[str, Any]:
        """CPU/네트워크 블로킹 작업이라 스레드로 밀어낸다 (이벤트 루프 보호)."""
        state = {
            "job_id": event["jobId"],
            "input_object_key": event["inputObjectKey"],
            "output_object_key": event["outputObjectKey"],
            "prompt": event.get("prompt", ""),
            "negative_prompt": event.get("negativePrompt", ""),
            "model": event.get("model", settings.openai_image_model),
            "output_size": event.get("outputSize", "1024x1024"),
        }

        last_error = "UNKNOWN"
        for attempt in range(1, settings.max_attempts + 1):
            final = await asyncio.to_thread(self._workflow.run, dict(state))
            error_code = final.get("error_code")
            if not error_code:
                return {"status": "succeeded", "outputObjectKey": event["outputObjectKey"]}

            last_error = error_code
            # 입력 자체가 잘못된 경우는 몇 번을 돌려도 같다 — 즉시 포기
            if error_code in ("INPUT_TOO_LARGE", "OPENAI_NOT_CONFIGURED"):
                break
            logger.warning("[kafka] job=%s 시도 %d 실패(%s)", event["jobId"], attempt, error_code)

        return {"status": "failed", "errorCode": last_error}

    async def _publish_result(self, job_id: str, result: dict[str, Any]) -> None:
        assert self._producer is not None
        payload = {
            "id": job_id,
            "jobId": job_id,
            "status": result["status"],
            "outputObjectKey": result.get("outputObjectKey"),
            "errorCode": result.get("errorCode"),
            "completedAt": datetime.now(timezone.utc).isoformat(),
        }
        await self._producer.send_and_wait(
            settings.result_topic,
            key=job_id.encode(),
            value=json.dumps(payload).encode(),
        )
        logger.info("[kafka] 결과 발행 job=%s status=%s", job_id, result["status"])

    @staticmethod
    def _parse(raw: bytes) -> Optional[dict[str, Any]]:
        """깨진 메시지는 조용히 버린다 — 재처리해도 절대 성공하지 않는다."""
        try:
            event = json.loads(raw.decode())
        except (UnicodeDecodeError, json.JSONDecodeError):
            logger.warning("[kafka] JSON 파싱 실패 메시지 드롭")
            return None

        if not isinstance(event, dict):
            return None
        required = ("jobId", "inputObjectKey", "outputObjectKey")
        missing = [key for key in required if not event.get(key)]
        if missing:
            logger.warning("[kafka] 필수 필드 누락 %s 메시지 드롭", missing)
            return None
        return event
