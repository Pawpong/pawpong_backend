"""S3 호환 스토리지 어댑터 (iwinv / OpenStack Swift).

NestJS StorageService 와 동일한 접속 규약을 쓴다:
  - endpoint_url 지정 + path-style 강제 (Swift 는 virtual-host 스타일 미지원)
  - region 은 의미 없지만 boto3 서명에 필요하므로 'default' 고정
"""

import logging

import boto3
from botocore.client import Config

from ..config import settings

logger = logging.getLogger(__name__)


class StorageAdapter:
    def __init__(self) -> None:
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name="default",
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )
        self._bucket = settings.s3_bucket

    def download(self, object_key: str) -> bytes:
        """원본 이미지를 메모리로 내려받는다.

        입력 크기는 head 로 먼저 확인해 과대 파일을 받기 전에 차단한다.
        (2 vCPU / 8GB 환경에서 대용량 파일이 메모리를 밀어내지 않도록)
        """
        head = self._client.head_object(Bucket=self._bucket, Key=object_key)
        size = head.get("ContentLength", 0)
        if size > settings.input_max_bytes:
            raise ValueError(f"INPUT_TOO_LARGE: {size} bytes")

        response = self._client.get_object(Bucket=self._bucket, Key=object_key)
        return response["Body"].read()

    def upload(self, object_key: str, data: bytes, content_type: str = "image/png") -> None:
        self._client.put_object(
            Bucket=self._bucket,
            Key=object_key,
            Body=data,
            ContentType=content_type,
        )
        logger.info("[storage] 업로드 완료: %s (%d bytes)", object_key, len(data))
