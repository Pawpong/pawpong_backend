"""OpenAI 이미지 변환 어댑터.

images.edit 를 사용한다 — 사용자의 반려동물 사진을 '입력'으로 주고
필터 프롬프트로 스타일만 바꾸는 것이 목적이라, 텍스트만으로 새로 그리는
images.generate 는 맞지 않다.
"""

import base64
import io
import logging
from typing import Sequence

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

    def edit(
        self,
        image_bytes: bytes,
        prompt: str,
        negative_prompt: str,
        model: str,
        size: str,
        reference_images: Sequence[bytes] = (),
        input_fidelity: str = "low",
    ) -> bytes:
        """스타일 변환된 PNG 바이트를 돌려준다.

        레퍼런스 이미지는 원본 뒤에 붙여 함께 보낸다. 첫 장이 변환 대상(반려동물 사진)이고
        나머지는 화풍 참고용이라는 것을 프롬프트에 명시해야 모델이 레퍼런스 속 대상을 그리지 않는다.
        input_fidelity=high 는 원본의 얼굴·털 무늬를 더 강하게 보존한다(비용↑). low 는 파라미터를
        아예 보내지 않는다 — 기본값이면서 이 옵션을 모르는 모델에서도 안전하다.
        """
        if not settings.openai_configured:
            raise OpenAiImageError("OPENAI_NOT_CONFIGURED", "OPENAI_API_KEY 미설정")

        # gpt-image-1 은 negative prompt 파라미터가 없어 프롬프트에 흡수시킨다
        full_prompt = prompt
        if reference_images:
            # 레퍼런스에 다른 동물이 있으면 모델이 귀·얼굴형을 섞어 그린다(말티즈가 코기 귀를 달고 나옴).
            # 레퍼런스에서 가져올 것(화풍)과 가져오면 안 될 것(대상의 생김새)을 모두 못 박는다.
            full_prompt = (
                "Image 1 is the pet to draw. Images 2+ are STYLE REFERENCES ONLY.\n"
                "From the references, copy only the art style: palette, outline weight, pixel/brush texture, "
                "shading and background mood.\n"
                "Do NOT copy anything about the animal in the references - not its species, breed, ear shape, "
                "face shape, fur color, markings or pose. The subject's appearance must come only from image 1 "
                "(same breed, ear shape, face, fur color and markings as the photo).\n\n"
                f"{full_prompt}"
            )
        if negative_prompt:
            full_prompt = f"{full_prompt}\n\nAvoid: {negative_prompt}"

        images = [_named_file(image_bytes, "input.png")]
        images += [_named_file(data, f"reference-{index}.png") for index, data in enumerate(reference_images, 1)]

        options = {}
        if input_fidelity == "high":
            options["input_fidelity"] = "high"

        try:
            response = self._client.images.edit(
                model=model or settings.openai_image_model,
                image=images if len(images) > 1 else images[0],
                prompt=full_prompt,
                size=size or "1024x1024",
                n=1,
                **options,
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


def _named_file(data: bytes, name: str) -> io.BytesIO:
    """SDK 가 multipart 파일명·MIME 을 확장자로 판단하므로 이름을 붙여 넘긴다."""
    file = io.BytesIO(data)
    file.name = name
    return file
