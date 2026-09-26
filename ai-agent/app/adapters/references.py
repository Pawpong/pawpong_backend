"""필터 스타일 레퍼런스 이미지 로딩.

레퍼런스는 관리자가 올린 화풍 참고 이미지다. 사용자 결과를 좌우하는 필수 입력이 아니므로
한 장을 못 읽어도 작업을 실패시키지 않고 건너뛴다 — 관리자가 레퍼런스를 지웠다고 해서
이미 접수된 사용자 생성이 깨지면 안 된다.
"""

import logging
from typing import Iterable

from . import pixel
from .storage import StorageAdapter

logger = logging.getLogger(__name__)

# OpenAI images.edit 는 요청당 이미지 16장까지 받는다 (원본 1장 + 레퍼런스)
MAX_REFERENCES = 4

# 화풍만 전달하면 되므로 원본보다 작게 줄여 업로드 비용·시간을 아낀다
REFERENCE_MAX_EDGE = 1024


def load_references(storage: StorageAdapter, object_keys: Iterable[str]) -> list[bytes]:
    references: list[bytes] = []
    for key in list(object_keys)[:MAX_REFERENCES]:
        if not key:
            continue
        try:
            references.append(pixel.normalize_input(storage.download(key), REFERENCE_MAX_EDGE))
        except Exception as error:  # noqa: BLE001
            logger.warning("[references] 레퍼런스 건너뜀 key=%s: %s", key, error)
    return references
