import { Injectable } from '@nestjs/common';

/**
 * 이메일 템플릿 서비스
 *
 * 포퐁 서비스의 다양한 이메일 템플릿을 생성합니다.
 */
@Injectable()
export class MailTemplateService {
    private readonly baseUrl = 'https://pawpong.kr';
    private readonly contactEmail = 'pawriendsofficial@gmail.com';

    /**
     * 공통 이메일 레이아웃
     * 포퐁 브랜드 컬러: Primary #4f3b2e (브라운), Secondary #a0c8f4 (파란색), Tertiary #f6f6ea (크림색)
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
            color: #4f3b2e;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #4f3b2e;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #3f2f25;
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
            background-color: #f6f6ea;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reason-list {
            background-color: #f6f6ea;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .reason-list li {
            margin-bottom: 8px;
        }
        h2 {
            color: #4f3b2e;
            margin-bottom: 20px;
        }
        h3 {
            color: #4f3b2e;
        }
        .emoji {
            font-size: 20px;
        }
        strong {
            color: #4f3b2e;
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
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
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
        const displayBreederName = breederName || '브리더';

        const reasonsHtml =
            rejectionReasons.length > 0
                ? `<ul class="reason-list">${rejectionReasons.map((r) => `<li>${r}</li>`).join('')}</ul>`
                : '<p>자세한 사유는 관리자에게 문의해주세요.</p>';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
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
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
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
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
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
     * [6] 프로필 완성 독려 이메일
     */
    getProfileCompletionReminderEmail(breederName: string): { subject: string; html: string } {
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님! 포퐁(Pawpong)입니다.</h2>

            <p>입점 승인이 완료된 이후, 아직 <strong>브리더 프로필 정보가 모두 등록되지 않아</strong> 입양자에게 노출되지 않고 있어요.</p>

            <p>포퐁에서는 브리더님의 소개, 환경, 분양 중인 아이 정보가 등록되어야 입양자와의 상담이 시작될 수 있어요.</p>

            <div class="highlight">
                <h3>✅ 지금 하면 좋아요</h3>
                <ul>
                    <li><strong>브리더 소개글 작성:</strong> 어떤 기준으로 브리딩을 하고 계신지 알려주세요. 브리더님의 개성과 전문성을 잘 드러나게 작성해주시면 좋아요!</li>
                    <li><strong>환경 사진 등록:</strong> 아이들이 지내는 공간은 입양자분들이 가장 궁금해하는 정보예요.</li>
                    <li><strong>분양 중인 아이 등록:</strong> 사진과 설명이 자세할수록 상담 신청 확률이 높아져요.</li>
                </ul>
            </div>

            <p>조금만 더 작성해주시면, 브리더님의 아이들을 더 많은 입양자에게 소개해드릴 수 있어요 🐶🐱</p>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 프로필을 완성해주세요 🐾',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [5] 신규 후기 등록 알림 이메일 (브리더용)
     */
    getNewReviewEmail(breederName: string): { subject: string; html: string } {
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight">
                <p class="emoji">⭐ 새로운 후기가 등록되었어요!</p>
                <p>입양자분이 브리더님에게 소중한 후기를 남겨주셨습니다.</p>
            </div>

            <p>💡 후기는 브리더님의 신뢰도를 높이고, 더 많은 입양 희망자에게 긍정적인 인상을 줄 수 있어요.<br>
            포퐁에서 확인해보세요!</p>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">내 프로필에서 후기 보기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 새로운 후기가 등록되었어요 ⭐',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [6] 상담 신청 확인 이메일 (신청자용)
     */
    getApplicationConfirmationEmail(applicantName: string, breederName: string): { subject: string; html: string } {
        // breederName이 빈 값일 경우를 대비하여 기본값 설정
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${applicantName || '입양자'}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight">
                <p class="emoji">✅ <strong>${displayBreederName}</strong> 브리더님께 상담 신청이 성공적으로 접수되었습니다!</p>
                <p>브리더님이 신청서를 확인하고 연락드릴 예정입니다.</p>
            </div>

            <p>💡 상담 진행 과정:</p>
            <ul>
                <li><strong>1단계:</strong> 브리더님이 신청서를 검토합니다</li>
                <li><strong>2단계:</strong> 브리더님이 직접 연락을 드립니다</li>
                <li><strong>3단계:</strong> 상담을 진행하고 입양 여부를 결정합니다</li>
            </ul>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">내 상담 신청 보기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 상담 신청이 접수되었습니다 ✅',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [7] 브리더 계정 정지 이메일
     */
    getBreederSuspensionEmail(breederName: string, reason: string): { subject: string; html: string } {
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight" style="background-color: #fee; border-left: 4px solid #c33;">
                <p class="emoji">⚠️ 브리더님의 계정이 정지되었습니다.</p>
                <p>현재 포퐁 서비스를 이용하실 수 없습니다.</p>
            </div>

            <h3>정지 사유</h3>
            <div class="reason-list">
                <p>${reason}</p>
            </div>

            <p>포퐁은 모든 사용자의 안전과 신뢰를 위해 서비스 이용약관 및 운영 정책을 엄격히 준수하고 있습니다.</p>

            <p>계정 정지와 관련하여 문의사항이 있으시면 아래 연락처로 문의해주시기 바랍니다.</p>

            <div class="highlight">
                <p><strong>문의 방법</strong></p>
                <p>
                    💌 이메일: ${this.contactEmail}<br>
                    💬 카카오톡 채널: 포퐁
                </p>
            </div>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 계정 정지 안내',
            html: this.getEmailLayout(content),
        };
    }

    /**
     * [8] 브리더 계정 정지 해제 이메일
     */
    getBreederUnsuspensionEmail(breederName: string): { subject: string; html: string } {
        const displayBreederName = breederName || '브리더';

        const content = `
            <h2>안녕하세요, ${displayBreederName}님.</h2>
            <p>반려동물 브리더 입양 플랫폼 <strong>포퐁(Pawpong)</strong>입니다.</p>

            <div class="highlight" style="background-color: #efe; border-left: 4px solid #4c4;">
                <p class="emoji">✅ 브리더님의 계정 정지가 해제되었습니다!</p>
                <p>이제 다시 포퐁 서비스를 이용하실 수 있습니다.</p>
            </div>

            <h3>✅ 다시 이용 가능한 서비스</h3>
            <ul>
                <li><strong>프로필 관리:</strong> 브리더 소개 및 정보 수정</li>
                <li><strong>아이 등록:</strong> 분양 중인 아이들 등록 및 관리</li>
                <li><strong>상담 신청 받기:</strong> 입양 희망자의 상담 신청 확인</li>
                <li><strong>리뷰 관리:</strong> 입양자가 남긴 후기 확인</li>
            </ul>

            <p>💡 포퐁은 윤리적 브리딩과 투명한 정보 공개를 가장 중요하게 생각합니다.<br>
            앞으로도 서비스 이용약관과 운영 정책을 준수하여 활동해주시기 바랍니다.</p>

            <p style="text-align: center;">
                <a href="${this.baseUrl}" class="button">포퐁 바로가기</a>
            </p>

            <p>감사합니다.</p>
        `;

        return {
            subject: '[포퐁] 브리더 계정이 복구되었습니다 ✅',
            html: this.getEmailLayout(content),
        };
    }
}
