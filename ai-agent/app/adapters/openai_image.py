"""OpenAI 이미지 변환 어댑터.

images.edit 를 사용한다 — 사용자의 반려동물 사진을 '입력'으로 주고
필터 프롬프트로 스타일만 바꾸는 것이 목적이라, 텍스트만으로 새로 그리는
images.generate 는 맞지 않다.
"""

import base64
import io
import logging

from openai import OpenAI

from ..config import settings

logger = logging.getLogger(__name__)


class OpenAiImageError(Exception):
    """호출 실패 — 재시도 가능 여부를 코드로 구분한다."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


class OpenAiImageAdapter:
    def __init__(self) -> None:
        self._client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout_seconds,
        )

    def edit(self, image_bytes: bytes, prompt: str, negative_prompt: str, model: str, size: str) -> bytes:
        """스타일 변환된 PNG 바이트를 돌려준다."""
        if not settings.openai_configured:
            raise OpenAiImageError("OPENAI_NOT_CONFIGURED", "OPENAI_API_KEY 미설정")

        # gpt-image-1 은 negative prompt 파라미터가 없어 프롬프트에 흡수시킨다
        full_prompt = prompt
        if negative_prompt:
            full_prompt = f"{prompt}\n\nAvoid: {negative_prompt}"

        image_file = io.BytesIO(image_bytes)
        image_file.name = "input.png"

        try:
            response = self._client.images.edit(
                model=model or settings.openai_image_model,
                image=image_file,
                prompt=full_prompt,
                size=size or "1024x1024",
                n=1,
            )
        except Exception as error:  # noqa: BLE001 — SDK 예외 계층이 버전마다 달라 광범위 포착
            # API 키는 절대 로그에 남기지 않는다 (SDK 는 메시지에 키를 넣지 않음)
            logger.error("[openai] 이미지 변환 실패: %s", error)
            raise OpenAiImageError("OPENAI_CALL_FAILED", str(error)) from error

        if not response.data:
            raise OpenAiImageError("OPENAI_EMPTY_RESPONSE", "응답에 이미지가 없음")

        encoded = response.data[0].b64_json
        if not encoded:
            raise OpenAiImageError("OPENAI_EMPTY_RESPONSE", "b64_json 누락")

        return base64.b64decode(encoded)
