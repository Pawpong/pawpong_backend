# 채팅·Kafka 운영 및 검증 가이드

## 목적

Pawpong 채팅은 Socket.IO `/chat` 네임스페이스와 Kafka `chat.message` 이벤트를 함께 사용한다.
메시지는 먼저 MongoDB에 저장되고, Kafka가 정상이면 각 백엔드 인스턴스의 consumer가 자기
인스턴스에 연결된 클라이언트로 `new_message`를 전파한다. Kafka가 일시적으로 중단되면 메시지를
저장한 인스턴스가 직접 전파해 단일 인스턴스 채팅을 유지한다.

## 로컬 구성

1. `docker compose -f docker-compose.dev.yml up -d kafka kafka-ui`
2. `.env`에서 `KAFKA_ENABLED=true`, `KAFKA_BROKER=localhost:9092`를 사용한다.
3. `pnpm start:dev`로 NestJS를 포그라운드 실행한다.
4. `http://localhost:8080/api/health`와 `http://localhost:8090`이 응답하는지 확인한다.

Kafka UI는 토픽·consumer group·메시지를 눈으로 확인하는 개발 전용 도구다. JWT나 운영 비밀값은
Kafka 메시지와 문서에 넣지 않는다.

## 다중 인스턴스 원칙

- producer client는 `producerOnlyMode`로 실행한다.
- WebSocket broadcast consumer group은 `KAFKA_CONSUMER_GROUP_ID-CONTAINER_NAME` 형식이다.
- blue/green처럼 여러 인스턴스가 같은 group을 공유하면 Kafka가 한 인스턴스에만 이벤트를 주므로,
  각 인스턴스의 `CONTAINER_NAME`은 반드시 고유해야 한다.
- 같은 인스턴스를 재시작할 때는 같은 이름을 유지해야 offset을 이어받고 불필요한 group이 늘지 않는다.

## 필수 검증 시나리오

### 정상 경로

1. 두 사용자로 같은 방에 접속해 `join_room`을 보낸다.
2. 한 사용자가 `send_message`를 보낸다.
3. MongoDB 저장, `chat.message` offset 증가, 양쪽의 `new_message` 수신을 확인한다.
4. 새로고침 후 REST 메시지 내역에도 같은 `messageId`가 한 번만 보이는지 확인한다.

### Kafka 장애 fallback

1. 채팅 연결을 유지한 채 `docker stop pawpong_dev_kafka`를 실행한다.
2. `/api/health`가 계속 200인지 확인한다.
3. 메시지를 보내 MongoDB 저장과 현재 인스턴스의 `new_message` 수신을 확인한다.
4. Kafka를 다시 시작했을 때 장애 중 메시지로 offset이 증가하지 않았는지 확인한다.
5. 복구 후 새 메시지를 보내 offset 증가와 consumer 전파가 다시 동작하는지 확인한다.

fallback은 단일 인스턴스 가용성을 위한 것이다. Kafka 장애 중 다른 백엔드 인스턴스에 연결된
클라이언트까지 실시간으로 전달하는 기능은 보장하지 않으며, 새로고침·폴링으로 DB 내역을 회복한다.

## 종료·테스트 수명주기

- 테스트는 `PAWPONG_TEST_MODE=true`, `KAFKA_ENABLED=false`로 외부 연결을 열지 않는다.
- 캐시는 cache-manager v7 계약에 맞춘 Keyv store를 사용한다.
- E2E가 끝난 뒤 Jest가 종료되지 않으면 `--detectOpenHandles`와 `lsof`로 Redis/Kafka 소켓을 확인한다.
- 종료 시 producer와 Redis 연결을 닫아 watch 재시작과 CI 프로세스가 남지 않게 한다.
