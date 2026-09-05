"""AI 이미지 변환 고정 워크플로 (LangGraph).

분기·자율 판단은 없다. 순서가 고정된 파이프라인을 LangGraph 로 표현하는 이유는
각 단계 실패 지점을 errorCode 로 정확히 구분하고, 이후 노드 추가(검열, 워터마크 등)를
배선 변경만으로 하기 위해서다.

  normalize → generate → pixelate → upload
"""

import logging
from typing import Optional, TypedDict

from langgraph.graph import END, StateGraph

from ..adapters import pixel
from ..adapters.openai_image import OpenAiImageAdapter, OpenAiImageError
from ..adapters.storage import StorageAdapter
from ..config import settings

logger = logging.getLogger(__name__)


class GenerationState(TypedDict, total=False):
    """그래프 상태.

    이미지 바이트는 상태에 담아 프로세스 메모리 안에서만 흐른다.
    디스크 임시 파일을 쓰지 않으므로 정리 누락으로 인한 디스크 누수가 없다.
    """

    job_id: str
    input_object_key: str
    output_object_key: str
    prompt: str
    negative_prompt: str
    model: str
    output_size: str

    source_bytes: bytes
    generated_bytes: bytes
    final_bytes: bytes

    error_code: Optional[str]


class AiImageWorkflow:
    def __init__(
        self,
        storage: Optional[StorageAdapter] = None,
        openai_adapter: Optional[OpenAiImageAdapter] = None,
    ) -> None:
        self._storage = storage or StorageAdapter()
        self._openai = openai_adapter or OpenAiImageAdapter()
        self._graph = self._build()

    def _build(self):
        graph = StateGraph(GenerationState)
        graph.add_node("normalize", self._normalize)
        graph.add_node("generate", self._generate)
        graph.add_node("pixelate", self._pixelate)
        graph.add_node("upload", self._upload)

        graph.set_entry_point("normalize")
        # 각 노드는 실패 시 error_code 를 채우고, 라우터가 즉시 END 로 보낸다
        for source, target in [
            ("normalize", "generate"),
            ("generate", "pixelate"),
            ("pixelate", "upload"),
        ]:
            graph.add_conditional_edges(
                source,
                self._route,
                {"continue": target, "abort": END},
            )
        graph.add_edge("upload", END)
        return graph.compile()

    @staticmethod
    def _route(state: GenerationState) -> str:
        return "abort" if state.get("error_code") else "continue"

    # --- 노드 ---

    def _normalize(self, state: GenerationState) -> GenerationState:
        try:
            raw = self._storage.download(state["input_object_key"])
            return {"source_bytes": pixel.normalize_input(raw, settings.input_max_edge)}
        except ValueError as error:
            logger.warning("[workflow] 입력 거부 job=%s: %s", state["job_id"], error)
            return {"error_code": "INPUT_TOO_LARGE"}
        except Exception as error:  # noqa: BLE001
            logger.error("[workflow] 원본 다운로드 실패 job=%s: %s", state["job_id"], error)
            return {"error_code": "INPUT_DOWNLOAD_FAILED"}

    def _generate(self, state: GenerationState) -> GenerationState:
        try:
            generated = self._openai.edit(
                image_bytes=state["source_bytes"],
                prompt=state["prompt"],
                negative_prompt=state.get("negative_prompt", ""),
                model=state["model"],
                size=state["output_size"],
            )
            return {"generated_bytes": generated}
        except OpenAiImageError as error:
            return {"error_code": error.code}

    def _pixelate(self, state: GenerationState) -> GenerationState:
        try:
            return {"final_bytes": pixel.pixelate(state["generated_bytes"])}
        except Exception as error:  # noqa: BLE001
            logger.error("[workflow] 후처리 실패 job=%s: %s", state["job_id"], error)
            # 후처리는 부가 단계다. 실패해도 원본 생성물을 살려 사용자에게 결과를 준다
            return {"final_bytes": state["generated_bytes"]}

    def _upload(self, state: GenerationState) -> GenerationState:
        try:
            self._storage.upload(state["output_object_key"], state["final_bytes"])
            return {}
        except Exception as error:  # noqa: BLE001
            logger.error("[workflow] 결과 업로드 실패 job=%s: %s", state["job_id"], error)
            return {"error_code": "OUTPUT_UPLOAD_FAILED"}

    # --- 실행 ---

    def run(self, state: GenerationState) -> GenerationState:
        return self._graph.invoke(state)
