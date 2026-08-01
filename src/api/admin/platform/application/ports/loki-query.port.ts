/**
 * Loki 로그 쿼리 Port
 *
 * 로그 수집 인프라(Loki)와의 경계를 정의합니다.
 * Adapter가 이 인터페이스를 구현하여 실제 HTTP 통신을 담당합니다.
 */
export const LOKI_QUERY_PORT = Symbol('LOKI_QUERY_PORT');

/**
 * Loki에서 파싱된 단일 로그 항목
 */
export interface LokiLogEntry {
    /** Winston JSON의 timestamp 필드 (ISO 8601) */
    timestamp: string;
    /** 로그 레벨 (error | warn | info | debug) */
    level: string;
    /** NestJS 컨텍스트 (클래스명 또는 모듈명) */
    context: string;
    /** 로그 메시지 본문 */
    message: string;
    /** blue | green */
    deployment: string;
}

/**
 * queryErrorsAndWarnings 호출 옵션
 */
export interface LokiQueryOptions {
    /** 조회 시작 시간 (ISO 8601) */
    from: string;
    /** 조회 종료 시간 (ISO 8601) */
    to: string;
    /** 최대 조회 건수 (기본 1000) */
    limit: number;
}

/**
 * Loki 쿼리 Port 인터페이스
 */
export interface ILokiQueryPort {
    /**
     * 지정 기간의 error/warn 레벨 로그를 전부 조회합니다.
     */
    queryErrorsAndWarnings(options: LokiQueryOptions): Promise<LokiLogEntry[]>;

    /**
     * Loki 서비스 가용 여부를 확인합니다.
     */
    isAvailable(): Promise<boolean>;
}
