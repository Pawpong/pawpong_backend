import io
import unittest

from PIL import Image

from app.adapters import pixel
from app.graph.workflow import AiImageWorkflow


def _png(color=(200, 120, 80), size=(64, 64)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format="PNG")
    return buffer.getvalue()


class FakeStorage:
    def __init__(self, objects):
        self.objects = objects
        self.uploaded = {}

    def download(self, key):
        if key not in self.objects:
            raise KeyError(key)
        return self.objects[key]

    def upload(self, key, data, content_type="image/png"):
        self.uploaded[key] = data


class FakeOpenAi:
    def __init__(self, output: bytes):
        self.output = output
        self.calls = []

    def edit(self, **kwargs):
        self.calls.append(kwargs)
        return self.output


def _state(**overrides):
    state = {
        "job_id": "job-1",
        "input_object_key": "ai-image/source/a.png",
        "output_object_key": "ai-image/result/job-1.png",
        "prompt": "pixel art",
        "negative_prompt": "",
        "model": "gpt-image-1",
        "output_size": "1024x1024",
    }
    state.update(overrides)
    return state


class WorkflowTest(unittest.TestCase):
    def setUp(self):
        # 계단형 그라데이션이라 도트 처리 여부가 바이트로 구분된다
        gradient = Image.linear_gradient("L").convert("RGB").resize((128, 128))
        buffer = io.BytesIO()
        gradient.save(buffer, format="PNG")
        self.generated = buffer.getvalue()
        self.storage = FakeStorage({"ai-image/source/a.png": _png(), "ai-image/reference/r.png": _png((0, 0, 255))})
        self.openai = FakeOpenAi(self.generated)
        self.workflow = AiImageWorkflow(storage=self.storage, openai_adapter=self.openai)

    def test_none_post_process_keeps_generated_image(self):
        final = self.workflow.run(_state(post_process={"type": "none"}))
        self.assertIsNone(final.get("error_code"))
        self.assertEqual(self.storage.uploaded["ai-image/result/job-1.png"], self.generated)

    def test_pixelate_uses_filter_options(self):
        self.workflow.run(_state(post_process={"type": "pixelate", "pixelSize": 16, "paletteSize": 4}))
        expected = pixel.pixelate(self.generated, pixel_size=16, palette_size=4)
        self.assertEqual(self.storage.uploaded["ai-image/result/job-1.png"], expected)

    def test_missing_post_process_falls_back_to_pixelate(self):
        self.workflow.run(_state())
        expected = pixel.pixelate(self.generated)
        self.assertEqual(self.storage.uploaded["ai-image/result/job-1.png"], expected)

    def test_references_and_fidelity_are_passed_and_missing_reference_skipped(self):
        self.workflow.run(
            _state(
                reference_object_keys=["ai-image/reference/r.png", "ai-image/reference/gone.png"],
                input_fidelity="high",
                post_process={"type": "none"},
            )
        )
        call = self.openai.calls[0]
        self.assertEqual(len(call["reference_images"]), 1)
        self.assertEqual(call["input_fidelity"], "high")

    def test_missing_source_fails_with_download_error(self):
        final = self.workflow.run(_state(input_object_key="ai-image/source/none.png"))
        self.assertEqual(final["error_code"], "INPUT_DOWNLOAD_FAILED")
        self.assertEqual(self.openai.calls, [])


if __name__ == "__main__":
    unittest.main()
