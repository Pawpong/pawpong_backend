"""도트(픽셀아트) 후처리.

OpenAI 가 만든 이미지는 '픽셀아트 느낌'이지 실제 픽셀 격자가 아니다.
축소 → 팔레트 양자화 → NEAREST 확대로 진짜 격자에 스냅시킨다.
"""

import io

from PIL import Image


def normalize_input(data: bytes, max_edge: int) -> bytes:
    """입력 이미지를 정규화한다.

    - EXIF 회전 반영 (모바일 사진이 눕는 문제 방지)
    - 장축을 max_edge 로 축소 (OpenAI 업로드 비용·시간 절감)
    - RGBA → PNG 로 통일
    """
    from PIL import ImageOps

    image = Image.open(io.BytesIO(data))
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGBA")

    longest = max(image.size)
    if longest > max_edge:
        ratio = max_edge / longest
        image = image.resize((int(image.width * ratio), int(image.height * ratio)), Image.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def pixelate(data: bytes, pixel_size: int = 96, palette_size: int = 48) -> bytes:
    """도트 격자로 스냅시킨다.

    pixel_size 는 축소 후 장축 픽셀 수 = 도트 해상도.
    palette_size 는 색 수 — 낮출수록 레트로해진다.
    """
    image = Image.open(io.BytesIO(data)).convert("RGB")

    ratio = pixel_size / max(image.size)
    small = image.resize(
        (max(1, int(image.width * ratio)), max(1, int(image.height * ratio))),
        Image.LANCZOS,
    )

    # 팔레트 양자화 후 다시 RGB — 색 수를 줄여야 도트 느낌이 산다
    small = small.quantize(colors=palette_size, method=Image.MEDIANCUT).convert("RGB")

    # NEAREST 로 확대해야 격자가 뭉개지지 않는다
    result = small.resize(image.size, Image.NEAREST)

    buffer = io.BytesIO()
    result.save(buffer, format="PNG")
    return buffer.getvalue()
