/** Default policy texts (used until Firestore chapter_policies/main is saved). */

export const POLICY_DOC_ID = "main";

export type ChapterPolicies = {
  termsTitle: string;
  termsBody: string;
  privacyTitle: string;
  privacyBody: string;
  bylawsTitle: string;
  bylawsBody: string;
};

export const DEFAULT_POLICIES: ChapterPolicies = {
  termsTitle: "회원 이용약관 / Terms of Service",
  privacyTitle: "개인정보 처리방침 / Privacy Policy",
  bylawsTitle: "미주지회 정관 / Chapter Bylaws",
  termsBody: `한국작가회의 미주지회(이하 "지회") 회원 이용약관
Writers Association of Korea USA Chapter ("Chapter") — Member Terms of Service

제1조 (목적) / Article 1 (Purpose)
본 약관은 한국작가회의 미주지회 모바일·웹 서비스(이하 "서비스") 이용과 관련하여 지회와 회원 간의 권리·의무 및 책임사항을 정함을 목적으로 합니다.
These terms set forth the rights, obligations, and responsibilities between the Chapter and members regarding use of the Chapter mobile and web services ("Service").

제2조 (회원 자격) / Article 2 (Membership)
1. 지회 활동에 참여하거나 문학 창작·감상에 관심이 있는 분은 회원으로 가입할 수 있습니다.
   Those interested in Chapter activities or literary creation and appreciation may register as members.
2. 회원은 가입 시 사실에 근거한 정보를 제공해야 하며, 허위 정보 제공 시 지회는 회원 자격을 제한할 수 있습니다.
   Members must provide accurate information at registration; the Chapter may restrict membership for false information.

제3조 (회원의 의무) / Article 3 (Member Obligations)
1. 회원은 타인의 저작권·초상권 등 권리를 침해하지 않아야 합니다.
   Members must not infringe others' copyright, portrait rights, or other legal rights.
2. 게시판(시, 디카시, 수필 등)에 올리는 작품·글·사진은 본인이 저작권을 보유하거나 게시 권한이 있어야 합니다.
   Works, text, and images posted on boards (poetry, dica-poetry, essay, etc.) must be owned by the member or posted with permission.
3. 비방, 혐오, 불법 정보 유포 등 지회 운영 취지에 반하는 행위를 해서는 안 됩니다.
   Harassment, hate speech, illegal content, or conduct contrary to the Chapter's purpose is prohibited.

제4조 (연회비 및 후원) / Article 4 (Membership Dues & Donations)

1. 정회원 연회비는 연 USD $100입니다.
   Annual membership dues for regular members are USD $100 per year.

2. 지회는 문학 활동 지원을 위한 자발적 후원금을 받을 수 있습니다.
   The Chapter may accept voluntary donations to support literary activities.

3. 연회비·후원금의 납부 방법·기한은 지회가 별도로 안내하며, 납부 담당자는 Erica Chang 입니다.
   Payment methods and deadlines are announced separately; the treasurer is Erica Chang.

4. 가입 시 회원이 제공한 이메일로 연회비 안내를 발송합니다.
   A dues guide is sent to the email address provided at registration.

5. 가입 후 운영진이 회원 관리에서 확인·승인해야 로그인·회원 서비스를 이용할 수 있습니다.
   The chapter admin must review and approve your registration before login and member services.

6. 연회비 미납 시 지회는 게시·행사 참여 등 서비스 이용을 제한할 수 있습니다.
   Unpaid dues may result in restrictions on posting and event participation.

제5조 (서비스 이용) / Article 5 (Use of Service)
1. 지회는 회원에게 게시판 열람·창작 활동 참여 등 서비스를 제공합니다.
   The Chapter provides members with access to boards and participation in literary activities.
2. 비회원은 일부 콘텐츠를 열람할 수 있으며, 글쓰기 등 회원 전용 기능은 제한될 수 있습니다.
   Non-members may view some content; writing and other member-only features may be restricted.

제6조 (계정 관리) / Article 6 (Account Security)
1. 회원은 이메일·비밀번호를 안전하게 관리할 책임이 있습니다.
   Members are responsible for keeping their email and password secure.
2. 계정 도용이 의심될 경우 지회 운영진에게 즉시 알려야 합니다.
   Suspected account misuse must be reported to Chapter staff promptly.

제7조 (탈퇴 및 자격 제한) / Article 7 (Withdrawal & Restrictions)
1. 회원은 언제든지 탈퇴를 요청할 수 있습니다.
   Members may request withdrawal at any time.
2. 약관 위반 시 지회는 사전 통지 후 이용을 제한하거나 회원 자격을 박탈할 수 있습니다.
   For violations, the Chapter may restrict access or revoke membership after notice.

제8조 (면책) / Article 8 (Limitation of Liability)
지회는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 합리적 범위 내에서 책임을 제한합니다.
The Chapter's liability for service interruption due to force majeure or system failure is limited to a reasonable extent.

부칙 / Supplementary Provisions
본 약관은 가입일부터 적용됩니다.
These terms apply from the date of registration.
`,
  privacyBody: `한국작가회의 미주지회 개인정보 처리방침
Writers Association of Korea USA Chapter — Privacy Policy

1. 수집 항목 / Information Collected
· 필수 / Required: 이름(한글), 이메일, 비밀번호(암호화 저장)
  Name (Korean), email, password (stored in encrypted form)
· 선택 / Optional: 닉네임(활동명), 영문 이름, 거주 지역, 활동 장르
  Nickname (display name), English name, region, literary genre

2. 이용 목적 / Purpose of Use
· 회원 식별·로그인, 지회 활동 안내, 게시판 서비스 제공, 문의 응대
  Member identification and login, Chapter notices, board services, and inquiry response

3. 보관 기간 / Retention Period
· 회원 탈퇴 시까지 보관하며, 탈퇴 후 관련 법령에 따른 기간이 지나면 지체 없이 파기합니다.
  Data is retained until withdrawal; after withdrawal, it is deleted without delay when legally permitted.

4. 제3자 제공 / Disclosure to Third Parties
· 원칙적으로 회원 개인정보를 외부에 제공하지 않습니다.
  Personal information is not provided to third parties in principle.
· 법령에 따른 요청이 있는 경우 예외로 합니다.
  Exceptions apply when required by law.

5. 회원의 권리 / Your Rights
· 본인 정보 열람·수정·삭제(탈퇴)를 요청할 수 있습니다.
  You may request access, correction, or deletion of your data (including account withdrawal).

6. 문의 / Contact
· 개인정보 관련 문의는 미주지회 운영진 이메일로 연락해 주세요.
  For privacy inquiries, contact the Chapter administrators by email.
`,
  bylawsBody: `한국작가회의 미주지회 정관
Writers Association of Korea — USA Chapter Bylaws

※ 이 화면의 정관 본문은 운영진이 웹 「약관·정관 관리」에서 공식 정관 전문으로 교체·수정할 수 있습니다.
   Admins can replace this text with the official bylaws via Policy management on the website.

제1장 총칙 / Chapter 1 — General Provisions
제1조 (명칭) 본 지회는 「한국작가회의 미주지회」라 한다.
Article 1 (Name) This chapter is named the Writers Association of Korea USA Chapter.

제2조 (목적) 본 지회는 문학 창작과 교류를 통해 회원 간의 유대와 한국문학의 발전에 기여함을 목적으로 한다.
Article 2 (Purpose) The Chapter fosters literary creation and exchange, membership fellowship, and the advancement of Korean literature.

제3조 (사무소) 본 지회의 사무소는 미합중국 내에 둔다. 세부 주소는 운영진이 공지한다.
Article 3 (Office) The Chapter office is located in the United States; the address is announced by the administration.

제2장 회원 / Chapter 2 — Membership
제4조 (자격) 지회 목적에 찬동하는 자는 소정의 절차를 거쳐 회원이 될 수 있다.
Article 4 (Eligibility) Those who support the Chapter purpose may become members through the prescribed process.

제5조 (권리와 의무) 회원은 지회 활동에 참여할 권리와 정관·약관·회비 규정을 준수할 의무가 있다.
Article 5 (Rights & Duties) Members may participate in Chapter activities and must observe the bylaws, terms, and dues rules.

제3장 임원·운영 / Chapter 3 — Officers & Administration
제6조 (임원) 지회장·임원·사무국 등 조직은 조직도에 따르며, 임기는 지회 운영 규정에 따른다.
Article 6 (Officers) Officers follow the organization chart; terms follow Chapter rules.

제7조 (총회·이사회) 주요 사항은 총회 또는 이사회(운영진) 의결로 정한다.
Article 7 (Meetings) Major matters are decided by the general assembly or the executive board.

부칙 / Supplementary Provisions
본 정관의 세부 조항은 운영진이 공식 문서로 보완·게시한다.
Detailed articles will be supplemented and posted by the administration as the official document.
`,
};
