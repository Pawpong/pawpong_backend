export const SUPPORT_AGENT_PORT = Symbol('SUPPORT_AGENT_PORT');
export const SUPPORT_AGENT_CLIENT = 'SUPPORT_AGENT_CLIENT';

export type SupportFaq = { faqId: string; question: string; answer: string };
export interface SupportAgentPort {
    selectFaqs(question: string, faqs: SupportFaq[]): Promise<string[]>;
}
