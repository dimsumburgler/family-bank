# Paycha PRD

## Product Requirements Document

**Version:** 1.0  
**Date:** February 27, 2026  
**Status:** Draft  

---

## 1. Overview

### 1.1 Product Vision
Paycha is the simplest and most delightful peer-to-peer payments app for Hong Kong. We believe sending money should feel as effortless as sending a message — no friction, no confusion, just instant, joyful transactions.

### 1.2 Problem Statement
Existing P2P payment apps in Hong Kong (PayMe, Alipay HK, WeChat Pay) suffer from:
- **Cluttered interfaces** buried in super-app ecosystems
- **Slow onboarding** requiring multiple verification steps
- **Unclear UX** mixing payments with social feeds, shopping, and mini-programs
- **Fragmented experience** between different banks and e-wallets

### 1.3 Target Market
- **Primary:** Hong Kong residents aged 18-45
- **Secondary:** Small businesses, freelancers, and service providers
- **Tertiary:** Tourists and visitors needing local payment capability

### 1.4 Key Differentiators
1. **Radical simplicity** — One screen to send, one tap to confirm
2. **Delightful interactions** — Micro-animations, haptics, personality
3. **Instant onboarding** — HKID + phone number, verified in seconds
4. **No super-app bloat** — Payments only, done beautifully

---

## 2. User Personas

### 2.1 Primary: The Everyday Splitter — "Alex"
- 28, marketing manager, lives in Mong Kok
- Splits dinner bills, taxi fares, and rent with flatmates
- Frustrated by friends who "forget" to pay back
- Wants: Speed, clarity, payment reminders

### 2.2 Secondary: The Gig Worker — "Ming"
- 35, freelance photographer, works across HK
- Collects deposits and final payments from clients
- Needs professional invoicing and payment tracking
- Wants: Professional appearance, transaction history, receipts

### 2.3 Tertiary: The Tourist — "Sarah"
- 32, visiting from Singapore for a week
- Needs to pay local vendors, split costs with travel companions
- Doesn't have local bank account
- Wants: Easy top-up, currency clarity, English support

---

## 3. Core Features

### 3.1 MVP (Phase 1)

#### 3.1.1 Instant P2P Transfers
- Send money via phone number, Paycha ID, or QR code
- Real-time balance updates
- Transaction confirmation in < 3 seconds
- Push notifications for sent/received payments

#### 3.1.2 Simple Onboarding
- HKID verification (scan + selfie)
- Phone number binding
- Link FPS (Faster Payment System) for bank transfers
- Optional: Credit card top-up

#### 3.1.3 Paycha Wallet
- Store balance in HKD
- Top up via FPS, bank transfer, or credit card
- Withdraw to linked bank account (FPS)
- View transaction history with search and filters

#### 3.1.4 Request Money
- Generate payment requests with amount and note
- Share via messaging apps (WhatsApp, Telegram, Signal)
- Reminder notifications for unpaid requests
- Cancel or modify pending requests

### 3.2 Phase 2

#### 3.2.1 Group Payments
- Create groups for recurring splits (flatmates, trip buddies)
- Split bills equally or by custom amounts
- Track who has paid and who hasn't
- Auto-reminders for outstanding shares

#### 3.2.2 Paycha for Business
- QR code payments for merchants
- Simple invoicing with unique payment links
- Business dashboard with analytics
- Scheduled/recurring payments

#### 3.2.3 Social Features (Light)
- Add friends from contacts
- See friends' Paycha IDs
- Payment notes with emoji reactions
- (No social feed — keep it focused)

### 3.3 Phase 3

#### 3.3.1 International
- Multi-currency support (SGD, USD, CNY)
- Competitive FX rates
- Cross-border transfers

#### 3.3.2 Advanced Features
- Scheduled payments
- Savings goals/pots
- Spending insights and budgeting
- Integration with accounting software

---

## 4. User Flows

### 4.1 First-Time User Journey

```
Download App → Splash Screen → Phone Verification → HKID Scan → 
Selfie Check → Create Paycha ID → Link FPS/Bank → Ready to Pay
```

**Target:** Complete onboarding in under 2 minutes

### 4.2 Send Money (Happy Path)

```
Open App → Tap "Send" → Select Recipient → Enter Amount → 
Add Note (optional) → Confirm → Success Animation
```

**Target:** 4 taps from open to sent

### 4.3 Request Money

```
Open App → Tap "Request" → Enter Amount → Add Note → 
Share Link → Friend Pays → Notification Received
```

### 4.4 Check Balance & History

```
Open App → Home Screen Shows Balance → Scroll for Recent → 
Tap for Details → Full History with Filters
```

---

## 5. Design Principles

### 5.1 Visual Language
- **Clean:** Generous whitespace, minimal UI chrome
- **Playful:** Rounded corners, friendly typography, subtle animations
- **Trustworthy:** Clear confirmations, security indicators, transparent fees

### 5.2 Interaction Design
- **Immediate feedback:** Every action has a response
- **Progressive disclosure:** Show complexity only when needed
- **Delightful moments:** Success animations, confetti on milestones

### 5.3 Color Palette
- **Primary:** Vibrant coral (#FF6B6B) — energy, action
- **Secondary:** Deep navy (#1A1A2E) — trust, stability
- **Accent:** Mint green (#4ECDC4) — success, growth
- **Background:** Soft cream (#F7F7F5) — warmth, comfort

### 5.4 Typography
- **Headings:** Inter (bold, friendly)
- **Body:** SF Pro / Roboto (clean, readable)
- **Numbers:** Tabular figures for amounts

---

## 6. Technical Requirements

### 6.1 Platform
- **iOS:** Native Swift (primary)
- **Android:** Native Kotlin (secondary)
- **Web:** Progressive Web App for merchants

### 6.2 Backend
- **Cloud:** AWS Singapore (low latency for HK)
- **Database:** PostgreSQL for transactions, Redis for sessions
- **Payment Rails:** FPS (Faster Payment System), Visa/Mastercard
- **Security:** PCI DSS compliance, end-to-end encryption

### 6.3 Integrations
- **FPS:** HKICL Faster Payment System
- **KYC:** HKID verification via government API or partner
- **Push Notifications:** Firebase Cloud Messaging, APNS
- **Analytics:** Mixpanel, Amplitude

### 6.4 Security
- Biometric authentication (Face ID / Touch ID / Fingerprint)
- PIN fallback
- Transaction signing
- Device binding
- Fraud detection via machine learning
- 24/7 transaction monitoring

---

## 7. Compliance & Legal

### 7.1 Licensing
- Apply for Stored Value Facility (SVF) license from HKMA
- Alternatively: Partner with licensed SVF operator

### 7.2 Regulatory Requirements
- Anti-Money Laundering (AML) compliance
- Know Your Customer (KYC) verification
- Transaction reporting for suspicious activity
- Data privacy (PDPO compliance)

### 7.3 Limits
| Tier | Daily Send Limit | Wallet Balance | Requirements |
|------|------------------|----------------|--------------|
| Basic | HK$3,000 | HK$10,000 | Phone + HKID |
| Verified | HK$50,000 | HK$100,000 | + Address proof |
| Business | HK$500,000 | Unlimited | Business registration |

---

## 8. Success Metrics

### 8.1 North Star Metric
**Monthly Active Users (MAU)** sending at least one payment

### 8.2 Key Metrics
| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|--------------------|
| Downloads | 100,000 | 500,000 |
| MAU | 50,000 | 250,000 |
| Avg. Transactions/User/Month | 8 | 12 |
| Transaction Success Rate | >99.5% | >99.9% |
| NPS Score | >50 | >60 |
| Onboarding Completion | >70% | >80% |
| Support Tickets/1K Users | <5 | <3 |

### 8.3 Retention
- Day 1: >60%
- Day 7: >40%
- Day 30: >25%

---

## 9. Competitive Analysis

| Feature | Paycha | PayMe | Alipay HK | WeChat Pay |
|---------|--------|-------|-----------|------------|
| P2P Speed | Instant | Instant | Instant | Instant |
| Onboarding Time | <2 min | ~5 min | ~5 min | ~5 min |
| App Focus | Payments only | Payments + Social | Super app | Super app |
| FPS Integration | Native | Native | Via partner | Via partner |
| UI Simplicity | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| Delight Factor | High | Medium | Low | Low |

---

## 10. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVF license delays | High | Partner with existing licensee |
| Fraud/chargebacks | High | Strong KYC, transaction limits, ML monitoring |
| Low user acquisition | Medium | Referral program, viral mechanics |
| Bank competition | Medium | Focus on UX differentiation |
| Regulatory changes | Medium | Legal counsel, compliance team |

---

## 11. Roadmap

### Q1 2026
- Finalize PRD and technical architecture
- Begin iOS development
- SVF license application or partnership discussions

### Q2 2026
- iOS MVP internal testing
- Backend infrastructure setup
- Security audit

### Q3 2026
- iOS public beta (Hong Kong only)
- Android development begins
- Merchant onboarding (beta)

### Q4 2026
- Official launch
- Marketing campaign
- Android release

### 2027
- Group payments
- Business features
- Regional expansion (Singapore, Malaysia)

---

## 12. Open Questions

1. Should we support Octopus card top-up/integration?
2. Partnership strategy: banks, telcos, or go direct?
3. Revenue model: FX spread, merchant fees, or premium features?
4. International expansion timeline?

---

## 13. Appendix

### 13.1 Glossary
- **FPS:** Faster Payment System (Hong Kong's real-time payment infrastructure)
- **HKMA:** Hong Kong Monetary Authority
- **SVF:** Stored Value Facility (e-money license)
- **P2P:** Peer-to-peer
- **KYC:** Know Your Customer

### 13.2 References
- HKMA SVF Guidelines
- FPS Technical Specifications
- Competitor app analysis (internal)
- User research interviews (n=20)

---

*Document Owner:* Product Team  
*Last Updated:* February 27, 2026  
*Next Review:* March 15, 2026
