export type FaqSeedItem = Readonly<{
    question: string;
    answer: string;
    category: 'service' | 'adoption' | 'breeder' | 'payment' | 'etc';
    userType: 'adopter' | 'breeder';
    order: number;
    isActive: true;
}>;

/**
 * 서비스의 현재 화면·API 흐름을 기준으로 관리하는 FAQ 원본.
 *
 * 파충류 사육 안내는 종별 환경 차이를 전제로 하며 MSD Veterinary Manual의
 * husbandry 지침과 CDC의 파충류 접촉 위생 지침을 참고했다. 진단·처방이나
 * 획일적인 온습도 수치를 제공하지 않고 브리더와 특수동물 진료 수의사의
 * 종별 안내를 확인하도록 한다.
 */
export const faqData: readonly FaqSeedItem[] = [
    {
        question: '포퐁에서는 어떤 반려동물을 만날 수 있나요?',
        answer: '강아지, 고양이와 도마뱀을 포함한 파충류 분양글을 탐색할 수 있어요. 탐색 화면에서 동물 종류와 품종을 선택하면 현재 등록된 아이와 브리더를 모아 볼 수 있습니다. 검색 결과는 브리더가 등록한 정보이므로 상담 전에 최신 상태를 한 번 더 확인해 주세요.',
        category: 'service',
        userType: 'adopter',
        order: 1,
        isActive: true,
    },
    {
        question: '브리더 검증은 무엇을 확인하나요?',
        answer: '포퐁은 브리더 가입 과정에서 신원과 동물생산업 등록 관련 서류를 제출받아 입점 여부를 검토합니다. 검증 상태는 제출 자료를 확인했다는 뜻이며, 특정 동물의 건강이나 입양 결과를 보증하는 등급은 아닙니다. 개체별 건강 기록과 사육 환경은 상세 정보와 상담을 통해 직접 확인해 주세요.',
        category: 'breeder',
        userType: 'adopter',
        order: 2,
        isActive: true,
    },
    {
        question: '입양 신청은 어떻게 하나요?',
        answer: '분양 상세에서 아이의 정보와 브리더를 확인한 뒤 ‘입양 신청하기’를 눌러 신청서를 작성해 주세요. 제출한 신청의 진행 상태와 상세 내용은 마이홈의 ‘신청·후기 내역’에서 다시 확인할 수 있습니다.',
        category: 'adoption',
        userType: 'adopter',
        order: 3,
        isActive: true,
    },
    {
        question: '브리더와 대화하려면 어떻게 하나요?',
        answer: '브리더 홈의 ‘메시지’ 버튼을 누르면 기존 채팅방을 열거나 새 채팅방을 만들 수 있어요. 입양 신청과 관련된 내용은 신청한 아이와 생활 환경을 함께 적어 두면 상담을 이어가기 편합니다.',
        category: 'service',
        userType: 'adopter',
        order: 4,
        isActive: true,
    },
    {
        question: '관심 동물과 즐겨찾는 브리더는 어디서 확인하나요?',
        answer: '분양 카드의 관심 버튼과 브리더 카드의 즐겨찾기 버튼을 누르면 ‘저장목록’에서 각각 모아 볼 수 있어요. 커뮤니티에서 저장한 글도 같은 화면의 별도 탭에서 확인할 수 있습니다.',
        category: 'service',
        userType: 'adopter',
        order: 5,
        isActive: true,
    },
    {
        question: '분양중·예약중·입양완료 상태는 실시간인가요?',
        answer: '상태는 브리더가 분양글에서 직접 관리하고 포퐁 화면에 반영됩니다. 변경 직후이거나 상담이 동시에 진행 중이면 실제 상황과 차이가 생길 수 있으니, 신청 전에 채팅으로 현재 가능 여부를 확인해 주세요.',
        category: 'adoption',
        userType: 'adopter',
        order: 6,
        isActive: true,
    },
    {
        question: '도마뱀을 입양하기 전에 무엇을 준비해야 하나요?',
        answer: '도마뱀은 종마다 필요한 사육장 크기, 온도·습도 구간, 조명과 UVB, 바닥재, 먹이가 크게 달라요. 입양하려는 종의 정확한 이름과 성장 후 크기를 확인하고, 브리더에게 현재 사육 조건과 급여 기록을 받아 같은 환경을 먼저 준비해 주세요. 이상 증상이 있거나 관리 기준이 불분명하면 파충류 진료가 가능한 수의사에게 상담하는 것이 안전합니다.',
        category: 'adoption',
        userType: 'adopter',
        order: 7,
        isActive: true,
    },
    {
        question: '파충류를 만진 뒤 주의할 점이 있나요?',
        answer: '건강해 보이는 파충류와 사육 환경에도 사람에게 질병을 일으킬 수 있는 균이 있을 수 있어요. 동물, 먹이, 사육장과 용품을 만진 뒤에는 비누와 흐르는 물로 손을 씻고 주방이나 식품 준비 공간에서 용품을 세척하지 마세요. 어린아이, 고령자, 면역이 약한 가족이 있다면 입양 전에 의료진과 수의사에게 위험을 상담해 주세요.',
        category: 'adoption',
        userType: 'adopter',
        order: 8,
        isActive: true,
    },
    {
        question: '예방접종과 건강 정보는 어디서 확인하나요?',
        answer: '브리더가 입력한 접종, 검사와 부모 동물 정보는 분양 상세에서 확인할 수 있어요. 동물 종류와 개체에 따라 필요한 관리가 다르므로 증빙 원본, 최근 진료 기록과 인계 후 관리 방법은 상담에서 다시 확인해 주세요. 포퐁의 화면 정보는 수의사의 진단을 대신하지 않습니다.',
        category: 'adoption',
        userType: 'adopter',
        order: 9,
        isActive: true,
    },
    {
        question: '상담이나 입양 후 후기는 언제 쓸 수 있나요?',
        answer: '상담이 완료되면 상담 후기를, 입양이 승인되면 입양 후기를 ‘신청·후기 내역’에서 작성할 수 있어요. 한 신청에는 진행 결과에 맞는 후기 한 건을 남길 수 있으며, 작성한 후기는 같은 화면에서 다시 확인할 수 있습니다.',
        category: 'service',
        userType: 'adopter',
        order: 10,
        isActive: true,
    },
    {
        question: '허위 정보나 부적절한 게시물을 발견하면 어떻게 하나요?',
        answer: '커뮤니티 게시글의 더보기 메뉴에서 신고 사유를 선택해 접수할 수 있어요. 긴급한 계정·개인정보 문의는 coldingcontact@gmail.com으로 화면 주소와 상황을 함께 보내 주세요.',
        category: 'service',
        userType: 'adopter',
        order: 11,
        isActive: true,
    },
    {
        question: '분양 비용은 어떻게 확인하나요?',
        answer: '브리더가 공개한 가격 또는 가격 범위는 분양 상세에서 확인할 수 있고, 상담 후 공개로 설정된 경우에는 채팅에서 문의할 수 있어요. 최종 비용과 포함 항목은 계약 전에 브리더와 서면으로 확인해 주세요.',
        category: 'payment',
        userType: 'adopter',
        order: 12,
        isActive: true,
    },
    {
        question: '브리더 가입과 입점 검증은 어떻게 진행되나요?',
        answer: '회원가입에서 브리딩 동물, 프로필과 사업장 정보를 입력하고 검증 서류를 제출해 주세요. 포퐁이 자료를 검토한 뒤 pending, reviewing, approved, rejected 상태로 결과를 관리합니다. 현재 New·Elite 같은 브리더 등급은 운영하지 않습니다.',
        category: 'breeder',
        userType: 'breeder',
        order: 1,
        isActive: true,
    },
    {
        question: '입점 검증에 필요한 기본 서류는 무엇인가요?',
        answer: '현재 가입 흐름에서는 신분증 사본과 동물생산업 등록증을 기본 검증 자료로 제출합니다. 파일의 민감 정보는 필요한 범위만 보이도록 처리하고, 실제 등록 정보와 사업장 정보가 일치하는지 확인해 주세요. 추가 확인이 필요하면 담당자가 별도 자료를 요청할 수 있습니다.',
        category: 'breeder',
        userType: 'breeder',
        order: 2,
        isActive: true,
    },
    {
        question: '도마뱀을 전문으로 하는 브리더도 가입할 수 있나요?',
        answer: '네. 브리딩 동물 선택에서 도마뱀을 고르고 취급 품종을 등록할 수 있어요. 분양글에는 종명, 생년월일, 성별뿐 아니라 현재 사육장의 온도·습도, 조명·UVB, 먹이와 급여 주기, 탈피와 건강 이력을 구체적으로 적어 주세요.',
        category: 'breeder',
        userType: 'breeder',
        order: 3,
        isActive: true,
    },
    {
        question: '분양글은 어떻게 작성하고 관리하나요?',
        answer: '마이홈의 ‘분양글 작성하기’에서 기본 정보, 건강 정보, 부모 동물, 사육 환경과 사진을 입력해 등록할 수 있어요. 작성한 글은 ‘분양글 관리’에서 수정하고 분양중·예약중·입양완료 상태를 최신으로 유지해 주세요.',
        category: 'adoption',
        userType: 'breeder',
        order: 4,
        isActive: true,
    },
    {
        question: '입양 신청이 들어오면 어디서 확인하나요?',
        answer: '브리더 관리 화면에서 신청 목록과 신청서 상세를 확인하고 상담 진행 상태를 변경할 수 있어요. 신청자와 추가 확인이 필요하면 연결된 채팅을 이용해 대화를 이어가 주세요.',
        category: 'adoption',
        userType: 'breeder',
        order: 5,
        isActive: true,
    },
    {
        question: '브리더 프로필에는 어떤 정보를 관리할 수 있나요?',
        answer: '마이홈과 프로필 수정에서 소개, 대표 사진과 사업장 위치를 관리할 수 있어요. 분양 가능한 아이와 부모 동물 정보는 별도 관리 화면에서 등록하며, 공개하기 어려운 상세 주소나 개인정보는 입력하지 마세요.',
        category: 'breeder',
        userType: 'breeder',
        order: 6,
        isActive: true,
    },
    {
        question: '입양자가 남긴 후기에 답변할 수 있나요?',
        answer: '브리더는 받은 후기 목록에서 답글을 작성·수정·삭제할 수 있어요. 입양자가 작성한 원문 자체는 브리더가 변경할 수 없습니다. 허위 정보나 권리 침해가 의심되면 coldingcontact@gmail.com으로 후기 주소와 근거를 보내 주세요.',
        category: 'service',
        userType: 'breeder',
        order: 7,
        isActive: true,
    },
    {
        question: '알림과 채팅은 어떻게 확인하나요?',
        answer: '새 신청과 서비스 알림은 알림 화면에서 확인할 수 있고, 대화는 채팅 탭에 모입니다. 읽지 않은 알림 수와 채팅방 상태는 서버에서 갱신되므로 목록에 문제가 있으면 화면의 재시도를 이용해 주세요.',
        category: 'service',
        userType: 'breeder',
        order: 8,
        isActive: true,
    },
    {
        question: '분양 상태는 언제 바꿔야 하나요?',
        answer: '상담이 진행되어 다른 신청을 받기 어려우면 예약중으로, 인계가 끝났으면 입양완료로 변경해 주세요. 실제 상태와 화면이 다르면 입양자가 중복 신청할 수 있으므로 변동이 생긴 즉시 갱신하는 것이 좋습니다.',
        category: 'adoption',
        userType: 'breeder',
        order: 9,
        isActive: true,
    },
    {
        question: '서비스 이용 중 문제가 생기면 어디로 문의하나요?',
        answer: '화면 오류, 계정, 검증 자료와 개인정보 문의는 coldingcontact@gmail.com으로 보내 주세요. 사용한 계정 역할, 발생 화면 주소, 시각과 오류 내용을 함께 적으면 확인에 도움이 됩니다. 비밀번호나 신분증 원본처럼 불필요한 민감 정보는 이메일에 첨부하지 마세요.',
        category: 'etc',
        userType: 'breeder',
        order: 10,
        isActive: true,
    },
];
