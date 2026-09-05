"""gRPC 서버 — 어드민이 프롬프트를 즉시 시험해보는 동기 경로.

사용자 생성은 Kafka 로만 처리한다. gRPC 는 '기다려도 되는 짧은 호출'만 담당한다.
"""

import logging
import asyncio
import time
import uuid
from typing import Optional

import grpc

from . import ai_agent_pb2, ai_agent_pb2_grpc
from .adapters import pixel
from .adapters.openai_image import OpenAiImageAdapter, OpenAiImageError
from .adapters.storage import StorageAdapter
from .adapters.support import select_faqs
from .config import settings

logger = logging.getLogger(__name__)

VERSION = "1.0.0"


class AiAgentServicer(ai_agent_pb2_grpc.AiAgentServiceServicer):
    def __init__(self, consumer=None) -> None:
        # 헬스체크에 컨슈머 상태를 함께 노출해 "붙었는데 큐를 못 먹는" 상황을 드러낸다
        self._consumer = consumer
        self._storage = StorageAdapter()
        self._openai = OpenAiImageAdapter()
        self._support_slots = asyncio.Semaphore(2)

    async def AnswerSupportInquiry(self, request, context):  # noqa: N802
        """문의는 이미지 큐와 독립적이며 무제한 대기·외부 오류 노출을 막는다."""
        if not request.question.strip() or len(request.question) > 2000 or len(request.faqs) > 60:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Invalid inquiry")
        if self._support_slots.locked():
            await context.abort(grpc.StatusCode.RESOURCE_EXHAUSTED, "Support busy")
        async with self._support_slots:
            try:
                faqs = [{"faq_id": faq.faq_id, "question": faq.question, "answer": faq.answer} for faq in request.faqs]
                async with asyncio.timeout(18):
                    ids = await select_faqs(request.question, faqs)
                return ai_agent_pb2.SupportInquiryResponse(faq_ids=ids)
            except Exception:
                logger.warning("[supportInquiry] AI 문의 응답 실패")
                await context.abort(grpc.StatusCode.UNAVAILABLE, "Support unavailable")

    async def HealthCheck(self, request, context):  # noqa: N802 — proto 규약
        kafka_connected = bool(self._consumer and self._consumer.connected)
        in_flight = self._consumer.in_flight if self._consumer else 0
        return ai_agent_pb2.HealthCheckResponse(
            status="SERVING" if (kafka_connected and settings.openai_configured) else "DEGRADED",
            version=VERSION,
            in_flight_jobs=in_flight,
            kafka_connected=kafka_connected,
            openai_configured=settings.openai_configured,
        )

    async def GenerateFilterPreview(self, request, context):  # noqa: N802
        started = time.monotonic()
        try:
            source = self._storage.download(request.input_object_key)
            normalized = pixel.normalize_input(source, settings.input_max_edge)

            generated = self._openai.edit(
                image_bytes=normalized,
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                model=request.model,
                size=request.output_size,
            )

            if request.post_process.type == "pixelate":
                generated = pixel.pixelate(
                    generated,
                    pixel_size=request.post_process.pixel_size or 96,
                    palette_size=request.post_process.palette_size or 48,
                )

            output_key = f"ai-image/preview/{uuid.uuid4().hex}.png"
            self._storage.upload(output_key, generated)

            return ai_agent_pb2.GenerateFilterPreviewResponse(
                success=True,
                output_object_key=output_key,
                latency_ms=int((time.monotonic() - started) * 1000),
            )
        except OpenAiImageError as error:
            return self._failure(error.code, str(error), started)
        except ValueError as error:
            return self._failure("INPUT_TOO_LARGE", str(error), started)
        except Exception as error:  # noqa: BLE001
            logger.exception("[grpc] 미리보기 실패")
            return self._failure("PREVIEW_FAILED", str(error), started)

    @staticmethod
    def _failure(code: str, message: str, started: float):
        # gRPC status 대신 응답 필드로 실패를 표현한다 — 어드민 UI 가 사유를 그대로 보여줄 수 있게
        return ai_agent_pb2.GenerateFilterPreviewResponse(
            success=False,
            error_code=code,
            error_message=message,
            latency_ms=int((time.monotonic() - started) * 1000),
        )


async def serve(consumer=None) -> grpc.aio.Server:
    server = grpc.aio.server()
    ai_agent_pb2_grpc.add_AiAgentServiceServicer_to_server(AiAgentServicer(consumer), server)
    server.add_insecure_port(f"[::]:{settings.grpc_port}")
    await server.start()
    logger.info("[grpc] 서버 시작 :%d", settings.grpc_port)
    return server
