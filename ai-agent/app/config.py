"""AI Agent 환경 설정.

OPENAI_API_KEY 는 이 컨테이너에만 존재해야 한다.
Kafka 메시지·gRPC 응답·로그 어디에도 값을 실어보내지 않는다.
"""

import os
from dataclasses import dataclass, field


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    # --- Kafka ---
    kafka_broker: str = field(default_factory=lambda: os.getenv("KAFKA_BROKER", "localhost:9092"))
    # NestJS KafkaTopic enum 과 반드시 일치해야 한다 (언어 경계 계약이라 .v1 고정)
    request_topic: str = "ai-image.request.v1"
    result_topic: str = "ai-image.result.v1"
    consumer_group: str = field(default_factory=lambda: os.getenv("AI_AGENT_GROUP_ID", "pawpong-ai-agent"))

    # --- gRPC ---
    grpc_port: int = field(default_factory=lambda: _int_env("AI_AGENT_GRPC_PORT", 50051))

    # --- OpenAI ---
    openai_api_key: str = field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    openai_image_model: str = field(default_factory=lambda: os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1"))
    openai_support_model: str = field(default_factory=lambda: os.getenv("OPENAI_SUPPORT_MODEL", "gpt-4o-mini"))
    openai_timeout_seconds: int = field(default_factory=lambda: _int_env("OPENAI_TIMEOUT_SECONDS", 180))

    # --- S3 호환 스토리지 (iwinv / OpenStack Swift) ---
    s3_endpoint: str = field(default_factory=lambda: os.getenv("SMILESERV_S3_ENDPOINT", ""))
    s3_access_key: str = field(default_factory=lambda: os.getenv("SMILESERV_S3_ACCESS_KEY", ""))
    s3_secret_key: str = field(default_factory=lambda: os.getenv("SMILESERV_S3_SECRET_KEY", ""))
    s3_bucket: str = field(default_factory=lambda: os.getenv("SMILESERV_S3_BUCKET", ""))

    # --- 운영 제한 (2 vCPU 단일 인스턴스 방어) ---
    concurrency: int = field(default_factory=lambda: _int_env("AI_CONCURRENCY", 1))
    max_attempts: int = field(default_factory=lambda: _int_env("AI_MAX_ATTEMPTS", 2))
    input_max_bytes: int = field(default_factory=lambda: _int_env("AI_IMAGE_INPUT_MAX_BYTES", 10 * 1024 * 1024))
    input_max_edge: int = field(default_factory=lambda: _int_env("AI_IMAGE_INPUT_MAX_EDGE", 2048))

    @property
    def openai_configured(self) -> bool:
        return bool(self.openai_api_key)


settings = Settings()
