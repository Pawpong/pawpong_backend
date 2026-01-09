import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

/**
 * Winston 로거 설정
 * 깔끔하고 읽기 쉬운 로그 포맷을 제공합니다.
 */
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 레벨별 색상 매핑 (ANSI escape codes)
 */
const levelColors: Record<string, string> = {
    error: '\x1b[31m', // 빨간색
    warn: '\x1b[33m', // 노란색
    info: '\x1b[32m', // 초록색
    debug: '\x1b[36m', // 시안색
    verbose: '\x1b[35m', // 마젠타
};
const resetColor = '\x1b[0m';

/**
 * 필터링할 NestJS 내부 로그 컨텍스트
 * 이 컨텍스트들은 시작 시 너무 많은 로그를 생성하므로 숨김
 */
const filteredContexts = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'MongooseModule',
    'ClientKafka', // Kafka 재연결 시도 로그 숨김
];

/**
 * 콘솔용 깔끔한 포맷 (개발 환경)
 * 형식: HH:mm:ss LEVEL [Context] 메시지
 */
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format((info) => {
        const context = info.context as string;
        // 필터링할 컨텍스트는 무시
        if (context && filteredContexts.includes(context)) {
            return false;
        }
        return info;
    })(),
    winston.format.printf((info) => {
        const { timestamp, level, message, context, stack } = info;
        const color = levelColors[level] || '';
        const ctx = context ? `[${context}]` : '';
        const levelTag = level.toUpperCase().padEnd(5);

        // 스택 트레이스는 첫 3줄만 표시
        let logMessage = message as string;
        if (stack && level === 'error') {
            const stackStr = String(stack);
            const stackLines = stackStr.split('\n').slice(0, 4).join('\n');
            logMessage = `${message}\n${color}${stackLines}${resetColor}`;
        }

        return `${color}${timestamp} ${levelTag}${resetColor} ${ctx} ${logMessage}`;
    }),
);

/**
 * 파일용 포맷 (로컬 로그 파일)
 */
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, context, stack } = info;
        const ctx = context ? `[${context}]` : '';
        let logMessage = message as string;
        if (stack) {
            const stackStr = String(stack);
            const firstLine = stackStr.split('\n')[1]?.trim() || '';
            logMessage = `${message} | Stack: ${firstLine}`;
        }
        return `${timestamp} [${level.toUpperCase()}] ${ctx} ${logMessage}`;
    }),
);

/**
 * Docker stdout용 JSON 포맷 (Loki/Promtail 연동)
 * Promtail이 JSON 파싱하여 level, context 등을 라벨로 추출
 */
const dockerJsonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
        const context = info.context as string;
        // 필터링할 컨텍스트는 무시
        if (context && filteredContexts.includes(context)) {
            return false;
        }
        return info;
    })(),
    winston.format.printf((info) => {
        const { timestamp, level, message, context, stack, ...rest } = info;
        const logObject: Record<string, any> = {
            timestamp,
            level,
            message,
        };
        if (context) logObject.context = context;
        if (stack) logObject.stack = stack;
        // 추가 메타데이터가 있으면 포함
        if (Object.keys(rest).length > 0) {
            logObject.metadata = rest;
        }
        return JSON.stringify(logObject);
    }),
);

/**
 * Winston 모듈 옵션 설정
 */
export const winstonConfig: WinstonModuleOptions = {
    level: logLevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    transports: [
        // 콘솔 출력 (프로덕션: JSON, 개발: 컬러풀)
        new winston.transports.Console({
            level: logLevel,
            format: isProduction ? dockerJsonFormat : consoleFormat,
        }),

        // 에러 로그 파일
        new winston.transports.File({
            level: 'error',
            filename: 'logs/error.log',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // 전체 로그 파일
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),

        // 개발 환경에서 디버그 로그 파일
        ...(process.env.NODE_ENV === 'development'
            ? [
                  new winston.transports.File({
                      level: 'debug',
                      filename: 'logs/debug.log',
                      format: fileFormat,
                      maxsize: 5242880, // 5MB
                      maxFiles: 3,
                  }),
              ]
            : []),
    ],
    // 예외와 rejection 처리
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: 'logs/rejections.log',
            format: fileFormat,
        }),
    ],
};
