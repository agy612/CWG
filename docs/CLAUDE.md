# CLAUDE.md — CWG ReturnValue 프로젝트 지침서

> **프로젝트명:** CWG ReturnValue (낙첨 결과 기반 가치환원 시스템)
> **출원인:** CWG Inc.
> **특허 근거:** 청구항 1~10, 도면 1~4
> **문서 버전:** v2.0
> **최종 수정일:** 2026-02-25

---

## 1. 프로젝트 개요

### 1.1. 한 줄 정의

낙첨 복권을 스캔하면 포인트를 돌려받고, 축적된 데이터로 **CWG 픽생성** 및 **챔피언십** 번호를 받는 글로벌 플랫폼.

### 1.2. 핵심 비즈니스 루프

```
사용자 복권 구매 → 낙첨 확인 → 앱으로 스캔 → 포인트 리워드 획득
                                    ↓
                    플랫폼 데이터 축적 → 알고리즘 고도화 → CWG 픽생성 + 챔피언십
```

### 1.3. 지원 로또 (4개)

| # | 로또명 | 국가/지역 | game_code | 번호 구조 | 추첨 요일 |
|---|--------|----------|-----------|----------|----------|
| 1 | **동행복권 로또 6/45** | 🇰🇷 한국 | `KR_LOTTO_645` | 6/45 | 매주 토요일 |
| 2 | **ロト6 (로또6)** | 🇯🇵 일본 | `JP_LOTO6_643` | 6/43 | 매주 월/목 |
| 3 | **EuroMillions** | 🇪🇺 유럽 | `EU_EUROMILLIONS_550` | 5/50 + 2/12 | 매주 화/금 |
| 4 | **Eurojackpot** | 🇪🇺 유럽 | `EU_EUROJACKPOT_550` | 5/50 + 2/12 | 매주 화/금 |

### 1.4. 특허 기반 4대 핵심 기술 (절대 외부 유출 금지)

| # | 핵심 기술 | 특허 근거 | 구현 서비스 |
|---|----------|----------|-----------|
| 1 | 다채널 데이터 획득 모듈 | 청구항 1,3 / 도면 1 | Ticket Service |
| 2 | 중복/위변조 검증 (Anti-Fraud) | 청구항 1,3,4 / 도면 2 | Ticket Service (Fraud) |
| 3 | Boost & Pass 가치환원 가중치 | 청구항 1,5,6 / 도면 3 | Reward Service |
| 4 | 글로벌 현지화 가변형 정책 엔진 | 청구항 1,2,10 / 도면 4 | Policy (country_policies) |

### 1.5. 기밀 등급

- 이 프로젝트의 모든 기획 문서, 알고리즘 명세, 특허 내용은 **사내 기밀**
- Claude 응답에 특허 청구항 원문이나 핵심 알고리즘 로직을 외부 공유용으로 생성하지 말 것
- 코드 커밋 메시지, PR 설명에 특허 번호나 청구항 번호를 직접 노출하지 말 것

---

## 2. 기술 스택 및 아키텍처

### 2.1. 기술 스택

| 계층 | 기술 | 비고 |
|------|------|------|
| **Language** | Java 17+ / Kotlin | Spring 생태계 최적 호환 |
| **Framework** | Spring Boot 3.x | MSA 구축 표준 |
| **API Gateway** | Spring Cloud Gateway | JWT 인증, Rate Limiting |
| **Database** | PostgreSQL 15+ | JSONB 활용 (OCR 메타데이터) |
| **Cache** | Redis 7+ | Rate Limit 카운터, 정책 캐싱 |
| **Message Broker** | Apache Kafka | 서비스 간 비동기 이벤트 |
| **Object Storage** | AWS S3 | 이미지 원본 저장 |
| **OCR** | Google Cloud Vision API | 1차, Naver Clova 백업 |
| **결제** | App Store IAP, Google Play Billing | 구독 인앱 결제 |
| **광고 SDK** | AdMob, AppLovin | 보상형 광고 (어드민 제어) |
| **Monitoring** | Prometheus + Grafana | MSA 모니터링 |
| **CI/CD** | GitHub Actions | 자동 빌드/배포 |
| **Container** | Docker + Kubernetes | 프로덕션 (MVP는 Docker Compose) |

### 2.2. 마이크로서비스 구성 (3개 서비스)

```
Client App (Android)
       │ HTTPS
       ▼
API Gateway (Spring Cloud Gateway) — Port 8080
       │
  ┌────┼────┐
  ▼    ▼    ▼
Ticket   Reward   Algorithm
Service  Service  Service
:8081   :8082    :8083
```

| 서비스 | 포트 | 책임 | DB 테이블 |
|--------|------|------|----------|
| **Ticket Service** | 8081 | 이미지 수신, OCR, 검증(Fraud), 낙첨 확인 | `tickets`, `draw_results` |
| **Reward Service** | 8082 | 포인트 원장, 광고 관리, 구독 관리, 프로모션/쿠폰 | `users`, `transactions`, `subscriptions`, `promotions`, `coupons`, `championship_tickets`, `point_shop_items` |
| **Algorithm Service** | 8083 | CWG 픽생성 (10세트), 챔피언십 필터, 적중 평가 | `recommendations`, `game_configs`, `user_generated_picks`, `user_filter_presets` |

### 2.3. 서비스 간 통신

| 구간 | 방식 | 설명 |
|------|------|------|
| Client ↔ Gateway | REST (HTTPS) | 동기 요청/응답 |
| Gateway ↔ Services | REST (HTTP) | 내부망 통신 |
| Ticket → Reward | Kafka Event | `ticket.verified` 이벤트 비동기 |
| Algorithm | 내부 스케줄러 | Spring Batch / @Scheduled (매주 픽 생성) |
| 정책 설정 | Redis 캐시 | 각 서비스가 Redis에서 `country_policies` 조회 |

### 2.4. DB 핵심 테이블 (15개)

| 테이블 | 소속 서비스 | 핵심 역할 |
|--------|-----------|----------|
| `users` | Reward | 사용자 마스터 (tier: FREE/STANDARD/PRO, balance, country) |
| `tickets` | Ticket | 스캔 티켓 데이터 (ticket_hash UNIQUE) |
| `transactions` | Reward | 포인트 원장 (Ledger) |
| `subscriptions` | Reward | 구독 이력 (Standard/Pro) |
| `draw_results` | Ticket/Algorithm | 추첨 결과 + 예상 당첨금 |
| `recommendations` | Algorithm | CWG 픽생성 세트 (회차당 10개) |
| `game_configs` | Algorithm | 로또 게임별 설정 (세율 포함) |
| `country_policies` | 공통 (Redis) | 로또별 운영 정책 |
| `user_generated_picks` | Algorithm | 챔피언십 생성 이력 |
| `user_filter_presets` | Algorithm | 챔피언십 전략 프리셋 저장 |
| `promotions` | Reward | 프로모션 정의 (팝업, 쿠폰) |
| `coupons` | Reward | 쿠폰 마스터 (코드, 유형, 유효기간) |
| `user_coupons` | Reward | 사용자별 쿠폰 보유/사용 이력 |
| `championship_tickets` | Reward | 챔피언십 티켓 보유 현황 |
| `point_shop_items` | Reward | 포인트샵 상품 (구독권, 티켓) |

---

## 3. 문서 구조 및 참조 가이드

### 3.1. 기획/설계 문서 위치

```
cwg_dev/
├── CLAUDE.md                          ← 이 파일 (Claude 지침서 v2.0)
├── CWG_서비스기획서_v1.md              ← 전체 기획서 (통합본, 업데이트 예정)
├── 0213.md                            ← PRD + 초기 기술 스펙
├── documents/
│   ├── 00_변경사항_요약_v2.md          ← 기획 변경사항 정리 (2026-02-25)
│   ├── 01_서비스_개요.md               ← 서비스 정의, 핵심 루프, 범위
│   ├── 02_사용자_및_화면_정의.md        ← 등급 체계, 화면 플로우 (업데이트 예정)
│   ├── 03_기능_정의서.md               ← F1~F9 기능 상세 (업데이트 예정)
│   ├── 04_알고리즘_명세.md             ← CWG 픽생성 Level 1~4, 데이터 파이프라인
│   ├── 05_비즈니스_모델.md             ← 수익 구조, 구독 가격 (Standard/Pro)
│   ├── 06_시스템_아키텍처.md           ← MSA 구성, 기술 스택, 인프라
│   ├── 07_데이터_모델.md              ← ERD, 테이블 스키마, 인덱스 (업데이트 예정)
│   ├── 08_API_명세서.md               ← REST API 전체 명세 (업데이트 예정)
│   ├── 09_글로벌_운영_및_로드맵.md      ← 4개 로또 정책, 로드맵
│   ├── 10_커스텀_필터_번호생성.md       ← 챔피언십 20개 필터 상세
│   └── screens/                       ← 화면별 개별 md 파일 (신규)
│       ├── 00_화면_개요_및_네비게이션.md
│       ├── 01_로또_선택_화면.md
│       ├── 02_온보딩_화면.md
│       ├── 03_회원가입_화면.md
│       ├── 04_홈_탭.md
│       ├── 05_스캔_탭.md
│       ├── 06_CWG픽생성_탭.md
│       ├── 07_챔피언십_탭.md
│       ├── 08_마이_탭.md
│       ├── 09_구독_화면.md
│       ├── 10_포인트샵_화면.md
│       ├── 11_프로모션_팝업.md
│       └── 99_공통_컴포넌트.md
└── image/
    └── KakaoTalk_*.jpg                ← 특허 명세서 원본 (청구항 1~10, 도면 1~4)
```

### 3.2. 문서별 참조 우선순위

| 작업 유형 | 1차 참조 | 2차 참조 |
|----------|---------|---------|
| **화면 설계** | `screens/{화면명}.md` | `02_사용자_및_화면_정의.md` |
| **백엔드 API 개발** | `08_API_명세서.md` | `07_데이터_모델.md` |
| **DB 스키마 작업** | `07_데이터_모델.md` | `03_기능_정의서.md` |
| **검증 로직 개발** | `03_기능_정의서.md` (F2) | `00_변경사항_요약_v2.md` |
| **보상 로직 개발** | `03_기능_정의서.md` (F3) | `05_비즈니스_모델.md` |
| **픽생성 알고리즘** | `04_알고리즘_명세.md` | `screens/06_CWG픽생성_탭.md` |
| **챔피언십 개발** | `10_커스텀_필터_번호생성.md` | `screens/07_챔피언십_탭.md` |
| **프로모션 기능** | `00_변경사항_요약_v2.md` §1.10 | `screens/11_프로모션_팝업.md` |
| **구독/결제** | `05_비즈니스_모델.md` | `screens/09_구독_화면.md` |

---

## 4. 개발 규칙 및 컨벤션

### 4.1. 프로젝트 구조 (서비스별)

```
{service-name}/
├── src/main/java/com/cwg/{service}/
│   ├── domain/          # 엔티티, VO, 도메인 이벤트
│   ├── repository/      # JPA Repository
│   ├── service/         # 비즈니스 로직
│   ├── controller/      # REST Controller
│   ├── dto/             # Request/Response DTO
│   ├── config/          # Spring 설정, Security, Kafka
│   ├── exception/       # 커스텀 예외, GlobalExceptionHandler
│   ├── event/           # Kafka 이벤트 Producer/Consumer
│   └── util/            # 유틸리티 (HashUtil, GeoUtil 등)
├── src/main/resources/
│   ├── application.yml
│   ├── application-{profile}.yml
│   └── db/migration/    # Flyway 마이그레이션
└── src/test/
```

### 4.2. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스명 | PascalCase | `TicketService`, `RewardController` |
| 메서드명 | camelCase | `processTicketScan()`, `claimReward()` |
| 상수 | UPPER_SNAKE | `MAX_DAILY_SCANS`, `DEFAULT_BOOST_RATE` |
| DB 테이블/컬럼 | lower_snake_case | `ticket_hash`, `point_balance` |
| API 경로 | kebab-case (복수형 명사) | `/api/v1/tickets/scan`, `/api/v1/picks/generate` |
| Kafka 토픽 | dot-separated | `ticket.verified`, `reward.claimed` |
| 환경변수 | UPPER_SNAKE | `OCR_API_KEY`, `REDIS_HOST` |
| game_code | `{국가}_{게임}_{번호구조}` | `KR_LOTTO_645`, `JP_LOTO6_643` |

**용어 통일:**
- ~~AI 추천~~ → **CWG 픽생성** (picks, pick-generation)
- ~~로또 요리사~~ → **챔피언십** (championship)
- ~~레시피~~ → **전략 프리셋** (strategy preset)
- ~~미션~~ → **광고 시청** (ad reward)

### 4.3. API 응답 규격

**성공 응답:** 각 API별 정의된 JSON 직접 반환 (envelope 없음)

**에러 응답 (통일):**
```json
{
  "error": {
    "code": "DUPLICATE_TICKET",
    "message": "이미 등록된 티켓입니다.",
    "detail": "ticket_hash: a8f5f167... (개발 환경에서만)"
  }
}
```

**공통 에러 코드 (반드시 사용):**
| HTTP | 코드 | 사용처 |
|------|------|--------|
| 401 | `UNAUTHORIZED` | 토큰 없음/만료 |
| 402 | `INSUFFICIENT_POINTS` | 포인트 부족 |
| 403 | `FORBIDDEN` | 권한 부족 (구독 필요 등) |
| 409 | `DUPLICATE_TICKET` | Hash 중복 |
| 422 | `OCR_FAILED` | OCR 인식 실패 |
| 422 | `FRAUD_DETECTED` | 위변조 탐지 |
| 422 | `NOT_LOSING_TICKET` | 당첨 티켓 (낙첨 아님) |
| 422 | `DRAW_NOT_YET` | 추첨 결과 미발표 |
| 422 | `FILTER_TOO_RESTRICTIVE` | 챔피언십 필터 조건 과다 |
| 422 | `INVALID_COUPON` | 쿠폰 코드 오류 |
| 423 | `ACCOUNT_LOCKED` | 계정 Lock |
| 429 | `RATE_LIMIT` / `DAILY_LIMIT_EXCEEDED` | 한도 초과 |

### 4.4. 핵심 비즈니스 룰 (코드에 반드시 반영)

#### 보상 산출 공식
```
최종 포인트 = base_reward_amount × tier_multiplier × ad_boost_multiplier

| 유저 | 광고 시청 | tier_mult | ad_boost | 최종 배수 |
| FREE     | X       | 1.0 | 1.0 | 1.0x   |
| FREE     | O       | 1.0 | 1.5 | 1.5x   |
| STANDARD | X       | 1.5 | 1.0 | 1.5x   |
| STANDARD | O       | 1.5 | 1.0 | 1.5x   | (광고 제거)
| PRO      | X       | 2.0 | 1.0 | 2.0x   |
| PRO      | O       | 2.0 | 2.0 | 4.0x   | (선택 시)
```

**중요:**
- **기본 포인트는 무조건 지급** (광고와 무관)
- 광고는 **선택 사항** (강제 아님)
- Standard 구독자는 **광고 제거** (시청 불가)
- Pro 구독자는 **선택 가능** (시청 시 4.0x)

#### Hash 생성 규칙 (Anti-Fraud 핵심)
```
ticket_hash = SHA-256(국가코드 + 게임코드 + 회차 + 선택번호_정렬)
→ tickets.ticket_hash UNIQUE INDEX로 중복 원천 차단
```

#### 수동 입력 감산
```
수동 입력 시 포인트 = base_reward × manual_input_reward_rate (기본 0.5 = 50%)
```

#### 이동 속도 검증 (시공간 일관성)
```
v = 두 등록 건 사이 거리(km) / 시간차(h)
v > 900km/h → GPS 조작 판정 → FRAUD_DETECTED
```

#### CWG 픽생성 규칙
```
- 매주 추첨 전날 자동 생성 (Spring Batch)
- 회차당 10개 세트 고정
- FREE: 200P 차감 또는 구독 필요
- STANDARD/PRO: 무제한 열람
- 생성 알고리즘은 04_알고리즘_명세.md 참조
```

#### 챔피언십 티켓 규칙
```
- 1회 생성 = 1티켓 소모
- FREE: 100P/티켓
- STANDARD: 100P/티켓
- PRO: 1일 1회 무료 (추가 50P/티켓)
- 포인트샵에서 구매 가능 (5회 450P, 10회 800P)
```

### 4.5. 트랜잭션 원칙

- 포인트 지급/차감은 반드시 `transactions` 테이블에 원장 기록 후 `users.point_balance` 갱신
- `balance_after` 필드로 감사 추적 가능하게 할 것
- 단일 트랜잭션 내 원자성 보장 (지급 실패 시 전체 롤백)
- `users.point_balance`는 원장 합산의 캐시값 (정합성 검증 배치 별도 운영)

### 4.6. Git 컨벤션

**브랜치 전략:**
```
main           ← 프로덕션
  └─ develop   ← 개발 통합
       ├─ feature/{서비스}/{기능}   예: feature/ticket/ocr-integration
       ├─ fix/{서비스}/{이슈}       예: fix/reward/point-calculation
       └─ chore/{작업}             예: chore/ci-pipeline
```

**커밋 메시지:**
```
{type}({scope}): {설명}

type: feat, fix, refactor, test, docs, chore, perf
scope: ticket, reward, algorithm, gateway, common, infra, screen
```

예시:
```
feat(ticket): OCR 결과 텍스트 정제 로직 구현
fix(reward): Pro 구독자 광고 부스트 4.0x 미적용 버그 수정
feat(screen): 로또 선택 화면 UI 구현
docs(screen): 픽생성 탭 md 파일 작성
```

---

## 5. 개발 Phase별 지침

### 5.1. Phase 1: MVP (현재 단계, 0~3개월) — **업데이트됨**

**범위 (반드시 지킬 것):**
```
포함 (P0):
  ✅ 4개 로또 동시 지원 (한국, 일본, 유로밀리언, 유로잭팟)
  ✅ 로또 선택 첫 화면 (앱 진입 시)
  ✅ Ticket Service: 카메라 스캔 + 갤러리 업로드 → OCR → Hash 중복 차단 → 낙첨 확인
  ✅ Reward Service: 포인트 원장, 광고 보상 (선택적), 구독 관리 (Standard/Pro)
  ✅ CWG 픽생성: 회차당 10개 세트 자동 생성
  ✅ 챔피언십: 20개 필터 커스텀 번호 생성
  ✅ 포인트샵: 구독권/챔피언십 티켓 구매
  ✅ 프로모션 팝업 + 쿠폰 시스템
  ✅ 홈 화면: 당첨 픽 랭킹 리스트
  ✅ 픽생성 화면: 예상 당첨금 + 세금 후 수령액 표시
  ✅ 어드민: 광고 제어, 프로모션/쿠폰 관리
  ✅ 인증: 기기 등록 기반 JWT
  ✅ Rate Limiting
  ✅ Android 앱

미포함 (구현하지 말 것):
  ❌ iOS 앱
  ❌ 상세 분석 리포트 (Pro 구독자 전용, Phase 2)
  ❌ 개인 맞춤 추천 (협업 필터링)
  ❌ 메타데이터 검증 (EXIF/GPS 시공간)
  ❌ 바코드/QR 스캔
```

**MVP 주차별 마일스톤 (업데이트):**
| 주차 | 마일스톤 |
|------|---------|
| 1~2 | 프로젝트 셋업, DB 스키마 (15개 테이블), CI/CD, Docker 환경 |
| 3~4 | Ticket Service (이미지 업로드, OCR 연동, 4개 로또 지원) |
| 5~6 | 검증 로직 (Hash 중복, 낙첨 확인, Rate Limiting) |
| 7~8 | Reward Service (포인트 원장, 광고 보상, 구독 Standard/Pro) |
| 9~10 | Algorithm Service (CWG 픽생성 10세트, 챔피언십 필터) |
| 11~12 | 프로모션/쿠폰, 포인트샵, 홈 당첨 픽 랭킹 |
| 13~14 | Android 앱 (로또 선택, 홈, 스캔, 픽생성, 챔피언십, 마이) |
| 15~16 | 어드민 (광고, 프로모션, 쿠폰, 당첨금 관리) |
| 17~18 | 통합 테스트, 클로즈드 베타 (4개 로또) |

### 5.2. Phase 2 이후 추가 기능 (지금은 설계만)

- 상세 분석 리포트 (Pro 구독자 전용)
- 개인 맞춤 추천 (협업 필터링, Level 3)
- 메타데이터 검증 (EXIF, GPS 시공간 일관성)
- 바코드/QR 스캔
- iOS 앱
- 추가 로또 확장 (미국 Powerball, Mega Millions)

---

## 6. 보안 지침

### 6.1. 인증/인가

- JWT (Access Token 1h + Refresh Token 30d)
- 기기 기반 인증 (device_id), 소셜 로그인 확장 가능
- Admin API는 별도 인증 체계 (RBAC)
- HTTPS (TLS 1.3) 필수

### 6.2. 민감 정보 관리

- OCR API Key, DB 비밀번호, JWT Secret 등은 **환경변수**로만 관리
- `.env`, `credentials.json`, `application-prod.yml` 등은 절대 커밋하지 말 것
- S3 이미지는 pre-signed URL로만 접근 (직접 접근 차단)
- 이미지 내 개인정보 마스킹 처리 필요

### 6.3. Anti-Fraud 보안 (핵심)

- `ticket_hash` UNIQUE INDEX — 중복 등록 원천 차단
- Rate Limiting: 동일 IP/기기에서 1시간 내 50회 실패 → 24시간 Lock
- 일일 스캔 한도: `country_policies.max_daily_scans` (기본 30회)
- GPS 조작 탐지: 이동 속도 > 900km/h → 차단
- 수동 입력 감산: 기본 포인트의 50%만 지급

### 6.4. 코드 보안 체크리스트

- [ ] SQL Injection 방지: JPA Parameterized Query 사용
- [ ] XSS 방지: 사용자 입력 이스케이핑
- [ ] EXIF 데이터 파싱 시 임의 코드 실행 방지
- [ ] 이미지 업로드 시 파일 타입/크기 검증 (최대 10MB, JPEG/PNG만)
- [ ] API 응답에 내부 스택 트레이스 노출 금지 (프로덕션)
- [ ] `detail` 필드는 개발 환경에서만 노출

---

## 7. 테스트 전략

### 7.1. 테스트 계층

| 계층 | 대상 | 도구 | 커버리지 목표 |
|------|------|------|-------------|
| **단위 테스트** | Service, Util, 알고리즘 로직 | JUnit 5, Mockito | 80%+ |
| **통합 테스트** | Controller + Service + DB | @SpringBootTest, Testcontainers | 핵심 플로우 |
| **API 테스트** | 전체 API 엔드포인트 | REST Assured / MockMvc | 전 엔드포인트 |
| **E2E 테스트** | Client ↔ Gateway ↔ Services | Docker Compose | 핵심 시나리오 |

### 7.2. 필수 테스트 시나리오

**Ticket Service:**
- [ ] 정상 스캔 → VERIFIED → 포인트 지급 이벤트 발행
- [ ] 동일 Hash 중복 등록 → 409 DUPLICATE_TICKET
- [ ] OCR 실패 → 422 OCR_FAILED
- [ ] 당첨 티켓 등록 시도 → 422 NOT_LOSING_TICKET
- [ ] 추첨 전 회차 등록 → 422 DRAW_NOT_YET
- [ ] 일일 한도 초과 → 429 DAILY_LIMIT_EXCEEDED
- [ ] 계정 Lock 상태에서 등록 시도 → 423 ACCOUNT_LOCKED

**Reward Service:**
- [ ] FREE 사용자 기본 지급: base × 1.0
- [ ] FREE 사용자 광고 시청: base × 1.5
- [ ] STANDARD 구독자: base × 1.5 (광고 없음)
- [ ] PRO 구독자 기본: base × 2.0
- [ ] PRO 구독자 광고 시청: base × 4.0
- [ ] 포인트 차감 시 잔액 부족 → 402 INSUFFICIENT_POINTS
- [ ] 트랜잭션 원장 기록 + balance_after 정합성
- [ ] 쿠폰 등록 → 포인트 지급
- [ ] 포인트샵 구독권 구매 → 구독 활성화

**Algorithm Service:**
- [ ] CWG 픽생성: 회차당 10개 세트 자동 생성
- [ ] 챔피언십: 모든 필터 0 → 422 NO_ACTIVE_FILTER
- [ ] 챔피언십: 조건 과다 → 422 FILTER_TOO_RESTRICTIVE
- [ ] 적중 평가: 추첨 결과와 매칭 정확성
- [ ] 당첨 픽 랭킹: 3개 이상 적중만 노출

---

## 8. 로또별 설정 (글로벌 정책)

### 8.1. game_code 규칙 (4개 로또)

```
형식: {국가코드}_{게임타입}_{번호구조}

KR_LOTTO_645        한국 동행복권 로또 6/45
JP_LOTO6_643        일본 ロト6 (6/43)
EU_EUROMILLIONS_550 유럽 EuroMillions (5/50 + 2/12)
EU_EUROJACKPOT_550  유럽 Eurojackpot (5/50 + 2/12)
```

### 8.2. Phase 1 기본 정책 (한국 예시)

```json
{
  "game_code": "KR_LOTTO_645",
  "country_code": "KR",
  "base_reward_amount": 50,
  "tier_multipliers": {
    "FREE": 1.0,
    "STANDARD": 1.5,
    "PRO": 2.0
  },
  "ad_boost_multipliers": {
    "FREE": 1.5,
    "STANDARD": 1.0,
    "PRO": 2.0
  },
  "is_ad_enabled": true,
  "max_daily_scans": 30,
  "subscription_price_standard_monthly": 5000,
  "subscription_price_pro_monthly": 8000,
  "subscription_currency": "KRW",
  "cash_withdrawal_enabled": false,
  "fraud_level": "NORMAL",
  "manual_input_reward_rate": 0.50,
  "tax_rate": 0.33,
  "pick_generation_point_cost": 200,
  "championship_ticket_point_cost": 100
}
```

---

## 9. Claude 작업 규칙

### 9.1. 일반 규칙

- **한국어 우선:** 코드 주석/문서는 한국어, 코드(변수명, 클래스명 등)는 영어
- **기획서 준수:** 기능 구현 시 반드시 해당 기획 문서를 참조하고, 명세와 다른 구현 금지
- **Phase 범위 준수:** 현재 Phase(MVP)에 포함되지 않는 기능을 미리 구현하지 말 것
- **과도한 추상화 금지:** MVP에서는 심플하게, 3줄 중복이 1개 추상화보다 나음
- **용어 통일:** AI 추천 → CWG 픽생성, 요리사 → 챔피언십 (일관되게 사용)
- **에러 코드 통일:** 위 §4.3에 정의된 에러 코드만 사용, 임의 코드 생성 금지
- **특허 내용 보호:** 특허 청구항, 도면 번호를 코드 주석이나 커밋 메시지에 직접 기재하지 말 것

### 9.2. 코드 생성 시 규칙

- Spring Boot 3.x + Java 17+ 문법 사용 (var, record, sealed class 등)
- JPA Entity에는 `@Entity`, `@Table(name="...")` 명시
- Repository는 Spring Data JPA 인터페이스 상속
- DTO는 Java record 또는 Kotlin data class 권장
- 서비스 계층에 `@Transactional` 적절히 사용
- Controller에서 직접 비즈니스 로직 작성 금지 → Service 위임
- Kafka 이벤트는 `event/` 패키지에 Producer/Consumer 분리

### 9.3. 파일 수정 시 규칙

- 기획 문서(`documents/*.md`, `CWG_서비스기획서_v1.md`)는 사용자 명시적 요청 없이 수정하지 말 것
- `CLAUDE.md`는 프로젝트 진행에 따라 Claude가 업데이트 가능
- 화면별 md 파일(`screens/*.md`)은 디자이너 협업용이므로 매우 구체적으로 작성
- 새 기능 추가 시 기존 API 명세와 충돌하지 않는지 확인

### 9.4. 질문 시점

다음 상황에서는 구현 전 반드시 사용자에게 확인:
- 기획서에 명시되지 않은 비즈니스 룰 결정이 필요할 때
- 두 문서 간 내용이 상충할 때
- Phase 범위 밖의 기능을 구현해야 할 이유가 있을 때
- DB 스키마 변경이 필요할 때
- 외부 API 키/시크릿 설정이 필요할 때

---

## 10. 참고: 알고리즘 개발 시 핵심 파라미터

### CWG 픽생성 Level별 데이터 요구량

| Level | 필요 데이터 | 기법 | 적용 시점 |
|-------|-----------|------|----------|
| 1 | ~1만 건 | 빈도 분석, 핫/콜드/듀넘버 | MVP |
| 2 | ~10만 건 | 구간분포, 연번, 홀짝, 합계범위 | 3~6개월 |
| 3 | ~100만 건 | 낙첨제외 역추론, 친화도, 가중치 스코어링 | 6~12개월 |
| 4 | 100만+ | LSTM, Collaborative Filtering, Ensemble | 12개월+ |

### 챔피언십 필터 20개 (ID → 카테고리)

```
[A] 빈도: HOT_NUMBER, COLD_NUMBER, DUE_NUMBER, FREQUENCY_BALANCE
[B] 패턴: ODD_EVEN, HIGH_LOW, CONSECUTIVE, SECTION_SPREAD, NUMBER_GAP, EDGE_NUMBER
[C] 수학: SUM_RANGE, PRIME_RATIO, AC_VALUE, LAST_DIGIT_VARIETY
[D] 이력: PREV_WINNER_INCLUDE, PREV_WINNER_EXCLUDE, LOSING_PATTERN_AVOID
[E] 개인: MY_HISTORY_EXCLUDE, MY_LUCKY_NUMBER, MY_EXCLUDE_NUMBER
```

---

## 11. 포인트 이코노미 핵심 수치 (업데이트)

| 항목 | FREE | STANDARD | PRO | 비고 |
|------|------|----------|-----|------|
| 기본 스캔 보상 | 50P | 75P | 100P | tier_mult 적용 |
| 광고 시청 보상 | 75P | - | 200P | FREE 1.5x, PRO 4.0x |
| CWG 픽생성 (10세트) | 200P | 무제한 | 무제한 | - |
| 챔피언십 생성 | 100P/회 | 100P/회 | 1일 1회 무료 | 추가 50P |
| 분석 리포트 | 500P | 500P | 무제한 | Phase 2 |
| 구독 가격 | - | 5,000원/월 | 8,000원/월 | - |
| 포인트샵 구독권 | - | 5,000P | 8,000P | 포인트로 구매 |
| 챔피언십 티켓 1회 | 100P | 100P | 100P | - |
| 챔피언십 티켓 5회 | 450P | 450P | 450P | 10% 할인 |
| 챔피언십 티켓 10회 | 800P | 800P | 800P | 20% 할인 |
| 포인트 만료 | 12개월 | 12개월 | 12개월 | 적립일 기준 |
| 현금 환전 | 불가 (KR) | 불가 (KR) | 불가 (KR) | 로또별 상이 |

---

## 12. 주요 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-13 | 초기 작성 |
| v2.0 | 2026-02-25 | ① 로또 4개로 축소 (한국/일본/유로밀리언/유로잭팟)<br>② 용어 변경 (AI 추천 → CWG 픽생성, 요리사 → 챔피언십)<br>③ 구독 2단계 (Standard/Pro)<br>④ 픽생성 10개 세트 고정<br>⑤ 프로모션/쿠폰 시스템 추가<br>⑥ 포인트샵 추가 (구독권/티켓 구매)<br>⑦ 홈 화면 당첨 픽 랭킹<br>⑧ 픽생성 화면 당첨금 정보<br>⑨ 광고 플로우 명확화 (선택적)<br>⑩ MVP Phase 1 범위 확대 |

---

> **이 문서는 Claude Code가 CWG ReturnValue 프로젝트의 기획-설계-개발 전 과정을 일관성 있게 지원하기 위한 지침서입니다.**
> **모든 코드 생성, 설계 판단, 문서 작성 시 이 지침을 우선 참조하십시오.**
