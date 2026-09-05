"""AI Agent 엔트리포인트.

Kafka 컨슈머(비동기 긴 작업)와 gRPC 서버(동기 즉시 호출)를 한 프로세스에서 함께 띄운다.
컨테이너를 둘로 나누지 않는 이유는 2 vCPU / 8GB 환경에서 프로세스 하나가
OpenAI 응답 대기로 대부분 idle 이기 때문이다.
"""

import asyncio
import logging
import signal

from .config import settings
from .grpc_server import serve
from .kafka_consumer import AiImageKafkaConsumer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s | %(message)s",
)
logger = logging.getLogger("ai-agent")


async def main() -> None:
    if not settings.openai_configured:
        # 죽이지는 않는다 — 헬스체크가 DEGRADED 로 뜨고, 작업은 즉시 FAILED 로 회신된다
        logger.warning("OPENAI_API_KEY 미설정 — 생성 요청은 모두 실패로 회신됩니다")

    consumer = AiImageKafkaConsumer()
    await consumer.start()
    server = await serve(consumer)

    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, stop_event.set)

    consume_task = asyncio.create_task(consumer.consume_forever())
    await stop_event.wait()

    logger.info("종료 신호 수신 — 진행 중 작업 마무리 후 정리합니다")
    consume_task.cancel()
    await server.stop(grace=10)
    await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())
