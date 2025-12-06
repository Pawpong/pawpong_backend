import { Injectable } from '@nestjs/common';

/**
 * 이메일 템플릿 서비스
 *
 * 포퐁 서비스의 다양한 이메일 템플릿을 생성합니다.
 */
@Injectable()
export class MailTemplateService {
    private readonly baseUrl = 'http://www.pawpong.kr';
    private readonly contactEmail = 'pawriendsofficial@gmail.com';

    /**
     * 공통 이메일 레이아웃
     */
    private getEmailLayout(content: string): string {
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>포퐁</title>
    <style>
        body {
            font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FF6B35;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #E55A25;
        }
        .footer {
            text-align: center;
            color: #888;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .highlight {
            background-color: #FFF5F0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reason-list {
            background-color: #FFF5F0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reason-list li {
            margin-bottom: 8px;
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .emoji {
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🐾 포퐁 (Pawpong)</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>— 포퐁 팀 드림 🐶🐱</p>
            <p>
                💌 문의<br>
                카카오톡 채널: 포퐁<br>
                이메일: ${this.contactEmail}
            </p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * [1] 브리더 입점 승인 이메일
     */
    getBreederApprovalEmail(breederName: string): { subject: string; html: string } {
        const content = `
            <h2>안녕하세요, ${breederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight">
                <p class="emoji">🎉 심사 결과, 브리더님의 입점이 승인되었습니다!</p>
                <p>이제 포퐁을 통해 반려동물을 책임감 있는 입양자에게 소개하실 수 있습니다.</p>
            </div>

            <h3>✅ 다음 단계를 진행해주세요.</h3>
            <ul>
                <li><strong>프로필 세팅:</strong> 브리더 소개글, 대표 사진, 입양 비용 범위 등을 등록해주세요. 자세히 적어주시면 더 좋아요!</li>
                <li><strong>분양중인 아이 등록:</strong> 분양중인 아이 정보를 등록해주세요. 사진과 함께 아이의 설명을 자세히 적어주시면 분양 확률이 올라갑니다.</li>
                <li><strong>엄마·아빠 등록:</strong> 브리딩에 참여중인 아이들 정보를 등록해주세요. 입양자분들은 엄마와 아빠 동물들을 궁금해해요.</li>
            </ul>

            <p>💡 윤리적 브리딩과 투명한 정보 공개는 포퐁이 가장 중요하게 생각하는 가치입니다.<br>
            브리더님의 신뢰 있는 활동이 더 많은 입양자에게 따뜻하게 닿을 거예요.</p>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 입점이 승인되었습니다 🎉',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [2] 브리더 입점 반려 이메일
     */
    getBreederRejectionEmail(breederName: string, rejectionReasons: string[]): { subject: string; html: string } {
        const reasonsHtml =
            rejectionReasons.length > 0
                ? `<ul class="reason-list">${rejectionReasons.map((r) => `<li>${r}</li>`).join('')}</ul>`
                : '<p>자세한 사유는 관리자에게 문의해주세요.</p>';

        const content = `
            <h2>안녕하세요, ${breederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <p>브리더님께서 제출해주신 입점 신청서를 검토한 결과,<br>
            <strong>현재 기준으로는 입점 승인이 어려운 점</strong> 안내드립니다.</p>

            <p>포퐁은 모든 입양 과정에서 동물의 건강, 브리딩 환경, 서류의 투명성을 매우 엄격히 검토하고 있습니다.<br>
            다음 사항을 보완하신 후 재신청해주시면 감사하겠습니다.</p>

            ${reasonsHtml}

            <div class="highlight">
                <p>보완 후 언제든 재심사 신청이 가능합니다.<br>
                포퐁은 윤리적 브리더분들이 더 넓은 입양자와 만날 수 있도록 늘 함께하겠습니다.</p>
            </div>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 입점 심사 결과 안내드립니다.',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [3] 새로운 상담 신청 알림 이메일
     */
    getNewApplicationEmail(breederName: string): { subject: string; html: string } {
        const content = `
            <h2>안녕하세요, ${breederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight">
                <p class="emoji">💬 새로운 입양자가 브리더님께 상담 신청을 보냈어요! 🐶🐱</p>
                <p>입양 희망자가 남긴 내용을 확인해보시고, 상담을 시작해보세요.</p>
            </div>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 새로운 입양 상담 신청이 도착했어요 💬',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [4] 서류 미제출 리마인드 이메일
     */
    getDocumentReminderEmail(breederName: string): { subject: string; html: string } {
        const content = `
            <h2>안녕하세요, ${breederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <p>브리더님께서 회원가입을 완료해주셨지만, 아직 <strong>입점 심사에 필요한 서류 제출이 완료되지 않아</strong>
            브리더님의 프로필이 입양자에게 노출되지 않고 있어요.</p>

            <div class="highlight">
                <p>서류 제출만 완료해주시면 브리더님의 아이들을 더 많은 입양자에게 안전하게 소개해드릴 수 있어요.</p>
                <p>윤리적인 브리딩을 실천하시는 브리더님께 포퐁이 꼭 도움이 되고 싶습니다. 🐶🐱</p>
            </div>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 입점 절차를 완료해주세요 ✨',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [5] 신규 후기 등록 알림 (이메일 없음 - 서비스 알림만)
     * 이 템플릿은 참조용으로만 존재
     */
    getNewReviewNotificationContent(): { title: string; content: string } {
        return {
            title: '⭐ 새로운 후기가 등록되었어요!',
            content: '브리더 프로필에서 후기를 확인해보세요.',
        };
    }
}
