# BuyWise Compliance Readiness Checklist & Legal Audit

**Document Version:** 1.0.0  
**Last Audit Date:** September 20, 2026  
**Applicability:** Indian Legal, Tax, E-Commerce, Consumer Protection, and Privacy Frameworks  
**Central Code Configuration:** `src/config/legalCompliance.ts`

---

## 1. Compliance Status Legend

* **GREEN [VERIFIED]**: Implemented and verified directly within the application codebase, backend security architecture, and runtime configuration.
* **YELLOW [PENDING CONFIRMATION]**: Technical capability exists, but formal business entity details, official tax numbers, or legal/accounting determinations require verification by the business owner, Chartered Accountant (CA), Company Secretary (CS), or legal counsel.
* **RED [ACTION REQUIRED]**: An immediate implementation defect, code security vulnerability, or non-compliant practice requiring code correction.

---

## 2. Compliance Checklist Matrix (Areas A through J)

| Area | Regulatory Domain | Current Status | Primary Code / Documentation Evidence | Action Needed |
| :--- | :--- | :---: | :--- | :--- |
| **A** | **Business Entity / MCA** | **YELLOW** | `src/config/legalCompliance.ts`, `src/components/StaticPage.tsx` | Owner/CS to determine and declare formal entity structure (Sole Proprietorship, Partnership, LLP, or Private Limited Company) and CIN/LLPIN once registered. |
| **B** | **Income Tax** | **YELLOW** | `src/config/legalCompliance.ts`, `server.ts` | CA to confirm PAN, advance tax schedule, ITR filing category, and TDS compliance. Note: *Income Tax Act, 2025* takes effect for tax years beginning 1 April 2026; prior years follow transitional provisions. |
| **C** | **Goods & Services Tax (GST)** | **YELLOW** | `src/config/legalCompliance.ts`, `server.ts` (Razorpay integration) | CA to assess GST registration requirement based on aggregate turnover (₹20L threshold) and nature of supply (inter-State supply of digital subscription services vs affiliate referral commissions). |
| **D** | **Consumer Protection / E-Commerce** | **YELLOW** | `src/components/StaticPage.tsx`, `src/components/DeleteAccountPage.tsx`, `src/config/legalCompliance.ts` | Grievance email (`mohammdsaeed24@gmail.com`) and aggregator role disclaimers are present. Owner must declare physical registered office address and formal Grievance Officer name. |
| **E** | **Privacy & Data Protection** | **GREEN** (Code) / **YELLOW** (Legal) | `src/components/DeleteAccountPage.tsx`, `src/components/StaticPage.tsx`, `src/config/legalCompliance.ts` | Accurate privacy disclosures implemented. Neutral statutory retention wording applied. Legal counsel to review DPDP Act compliance once final rules are fully notified by MeitY. |
| **F** | **Account & Data Deletion** | **GREEN** | `src/components/DeleteAccountPage.tsx`, `server.ts` (`/api/account/delete`, `/api/account/delete-request`), `src/lib/api.ts` | Real-time in-app authenticated deletion and 24-48h web deletion request forms operational. Multi-layer database purging verified. |
| **G** | **Authentication Security** | **GREEN** | `server.ts` (`authenticateUser` middleware), `test_security_account_deletion.ts` | Server-authoritative session token verification (HMAC-SHA256). Anti-spoofing for `x-user-id` and `x-user-email` enforced. Anti-IDOR protection on support tickets verified. |
| **H** | **Payment & Financial Security** | **GREEN** (Code) / **YELLOW** (KYC) | `server.ts` (`/api/razorpay/verify`, `/api/razorpay/webhook`), `src/components/PremiumModal.tsx` | `RAZORPAY_KEY_SECRET` strictly server-side. HMAC signature verification active. Zero card/CVV/UPI PIN storage. Owner must confirm live merchant KYC with Razorpay. |
| **I** | **Marketing & Price Claims** | **GREEN** | `src/components/CompareProducts.tsx`, `src/components/StaticPage.tsx`, `src/components/DisclaimerModal.tsx` | No fabricated prices. Clear merchant attribution (Amazon, Flipkart). Disclaimers clarify that prices and inventory are determined by third-party retailers. |
| **J** | **Children / Target Audience** | **GREEN** (Code) / **YELLOW** (Policy) | `src/config/legalCompliance.ts`, `metadata.json` | App does not target or knowingly collect data from children under 13. Play Store target age is set to teens & adults (13-15, 16-17, 18+). |

---

## 3. Detailed Audit Findings & Technical Evidence

### Area A: Business Entity & Ministry of Corporate Affairs (MCA)
* **Status:** **YELLOW [PENDING CONFIRMATION]**
* **Code Evidence:** 
  - `src/components/StaticPage.tsx` lists "Owner & Chairman: Awan Warsi".
  - `src/config/legalCompliance.ts` maintains placeholders for registered legal name, entity type, CIN/LLPIN, and registered office.
* **Findings:**
  - The codebase does NOT contain fabricated CIN, LLPIN, or registration numbers.
  - The application currently operates as an online platform. Whether it is a Sole Proprietorship, Partnership, LLP, or Private Limited Company must be confirmed by the owner and Company Secretary.
* **Action Required:**
  - When legal incorporation is completed, update `src/config/legalCompliance.ts` with the official legal entity name, corporate identification number (if applicable), and registered office.

---

### Area B: Income Tax
* **Status:** **YELLOW [PENDING CONFIRMATION]**
* **Code Evidence:** 
  - `server.ts`: Payment tracking logs transaction references and amounts.
  - `src/components/DeleteAccountPage.tsx`: Statutory retention notes retention of accounting records where required by applicable law.
* **Findings:**
  - The codebase does not make false or unverified tax exemptions or claims.
  - **Statutory Framework Note:** The *Income Tax Act, 2025* is scheduled to govern direct taxes for assessment years commencing on or after 1 April 2026. For earlier periods, transitional provisions under the *Income Tax Act, 1961* remain operative.
* **Action Required:**
  - Business owner and Chartered Accountant must maintain books of accounts, file appropriate Income Tax Returns (ITR), calculate advance tax on subscription & referral revenues, and execute any applicable Tax Deducted at Source (TDS) on vendor or creator payouts.

---

### Area C: Goods and Services Tax (GST)
* **Status:** **YELLOW [PENDING CONFIRMATION]**
* **Code Evidence:** 
  - `server.ts` (Razorpay payment handler for BuyWise Premium subscriptions).
  - `src/config/legalCompliance.ts` (GSTIN placeholder).
* **Findings:**
  - The codebase does NOT display an invented GSTIN.
  - BuyWise operates two revenue models:
    1. **Affiliate/Referral Commissions:** Commission payouts from e-commerce platforms (Amazon Associates, etc.).
    2. **Direct Digital Services (BuyWise Premium):** Online subscription fees paid by consumers across different Indian states.
  - Under Section 24 of the CGST Act, compulsory registration applies to inter-State taxable supplies of goods. For suppliers of **services**, *Notification No. 10/2017-Integrated Tax* (as amended) provides exemption from mandatory registration for inter-State supplies if aggregate annual turnover does not exceed ₹20 Lakh (or ₹10 Lakh in Special Category States).
* **Action Required:**
  - A Chartered Accountant must assess whether BuyWise's current or projected turnover exceeds ₹20 Lakh, or whether specific service classifications (such as Online Information and Database Access or Retrieval — OIDAR services or e-commerce facilitation) mandate GST registration before crossing the threshold.

---

### Area D: Consumer Protection & E-Commerce Rules, 2020
* **Status:** **YELLOW [PENDING CONFIRMATION]**
* **Code Evidence:** 
  - `src/components/StaticPage.tsx` (Service Description, Disclaimer, Refund Policy, Grievance Contact).
  - `src/components/DeleteAccountPage.tsx` (Data safety and grievance officer email).
  - `src/config/legalCompliance.ts` (Officers, turnaround SLA, role description).
* **Findings:**
  - Under the *Consumer Protection (E-Commerce) Rules, 2020*, digital platforms operating in India must provide:
    1. Clear distinction between platform role (aggregator/search tool) and third-party sellers. BuyWise complies with this: `StaticPage.tsx` explicitly clarifies that BuyWise does not sell or fulfill physical merchant goods.
    2. Grievance Redressal mechanism: Email provided (`mohammdsaeed24@gmail.com`). Turnaround standards specified (48-hour acknowledgment, 30-day resolution).
    3. Transparent refund and cancellation terms: Documented on `/refund-policy`.
* **Action Required:**
  - Owner must formally declare the physical registered office address and customer support contact number to fulfill complete statutory disclosure under Rule 4(1) of the E-Commerce Rules, 2020.

---

### Area E: Privacy & Data Protection (DPDP Act / Google Play)
* **Status:** **GREEN [CODE IMPLEMENTED]** / **YELLOW [LEGAL SIGNOFF]**
* **Code Evidence:** 
  - `src/components/DeleteAccountPage.tsx`: Neutral legal retention language implemented. Universal "7-year Companies Act" claim removed. Unverified claims of "GDPR certified" or "DPDP compliant" eliminated.
  - `src/components/StaticPage.tsx`: Accurate inventory of collected personal data (email, name, password hash, search queries, gamification points, support tickets).
  - `server.ts`: Passwords hashed with bcrypt; zero retention of raw card numbers or payment credentials.
* **Findings:**
  - The application supports data minimization, purpose specification, and user-initiated deletion.
  - Retained statutory records are restricted to necessary accounting/tax purposes and severed from marketing systems.
* **Action Required:**
  - As the Ministry of Electronics and Information Technology (MeitY) notifies final procedural rules under the *Digital Personal Data Protection Act, 2023 (DPDP Act)*, legal counsel must audit consent notices and data principal grievance workflows.

---

### Area F: Account Deletion Implementation
* **Status:** **GREEN [VERIFIED]**
* **Code Evidence:** 
  - `src/components/DeleteAccountPage.tsx` (Dual deletion pathways: In-app instant execution and public web form).
  - `server.ts`:
    - `POST /api/account/delete`: Authenticated via cryptographic token; purges user profile, auth credentials, gamification state, and associated support tickets.
    - `POST /api/account/delete-request`: Public unauthenticated endpoint for external data deletion requests.
  - `test_security_account_deletion.ts`: 10/10 automated tests passing.
* **Findings:**
  - Meets Google Play Developer Account Deletion Policy requirements:
    1. Dedicated web URL exists (`https://buywiser.store/delete-account`).
    2. Accessible both within the app and via external browser.
    3. Purges all associated personal and activity data.
    4. Retention of legally required records is stated neutrally and accurately without misleading blanket timelines.

---

### Area G: Authentication & API Security
* **Status:** **GREEN [VERIFIED]**
* **Code Evidence:** 
  - `server.ts`: `authenticateUser` middleware strictly enforces cryptographic session validation.
  - `src/lib/api.ts`: Axios interceptor automatically passes `Authorization: Bearer <token>` and `x-session-token`.
  - `test_security_account_deletion.ts`:
    - Spoofed `x-user-id` and `x-user-email` headers rejected with `401 Unauthorized` or `403 Forbidden`.
    - Cross-user support ticket access (IDOR) blocked with `403 Forbidden`.
    - Token replay/forgery blocked.
* **Findings:**
  - Zero client-header trust: The server strictly determines user identity from cryptographically verified tokens.

---

### Area H: Payment & Financial Security
* **Status:** **GREEN [CODE IMPLEMENTED]** / **YELLOW [MERCHANT KYC]**
* **Code Evidence:** 
  - `server.ts`:
    - `POST /api/razorpay/create-order`: Order generation happens server-side with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
    - `POST /api/razorpay/verify`: Validates Razorpay HMAC-SHA256 signature (`crypto.createHmac('sha256', secret)`).
    - Webhook handler verifies Razorpay webhook secret signature.
  - Frontend (`src/components/PremiumModal.tsx`): Only receives `order_id` and public `key_id`.
  - Sensitive payment instruments (credit cards, CVVs, UPI PINs) never touch BuyWise servers; they are processed entirely within Razorpay's PCI-DSS Level 1 compliant checkout modal.
* **Action Required:**
  - Owner must ensure Razorpay merchant account KYC is activated with the verified business bank account.

---

### Area I: Marketing & Price Disclaimers
* **Status:** **GREEN [VERIFIED]**
* **Code Evidence:** 
  - `src/components/CompareProducts.tsx`: Displays merchant badges (Amazon, Flipkart, Croma, etc.) and real-time deal analysis.
  - `src/components/StaticPage.tsx` ('disclaimer'): "While we strive for real-time accuracy, prices and availability are subject to change by the respective merchants. Always verify the final price at checkout."
  - Product search preserves exact Amazon ASIN when available and flags search type clearly.
* **Findings:**
  - Code does not generate deceptive "guaranteed price" claims or fake government endorsements.

---

### Area J: Children & Target Audience
* **Status:** **GREEN [VERIFIED]**
* **Code Evidence:** 
  - `src/config/legalCompliance.ts`: Target audience declared as 13-15, 16-17, 18+. Notice that BuyWise does not knowingly collect data from children under 13.
  - Google Play Console Declaration matches target audience settings.
* **Findings:**
  - BuyWise is a general shopping intelligence utility and is not marketed to young children.

---

## 4. Mandatory Anti-Misrepresentation Prohibitions

In accordance with strict legal compliance guidelines, the application and documentation **MUST NEVER**:
1. Invent or display unverified GSTINs, PANs, Corporate Identity Numbers (CIN), or LLPINs.
2. Claim "Government Approved", "Approved by Ministry of Commerce", or "100% Government Compliant".
3. Claim "GDPR Certified" or "DPDP Certified" (statutory frameworks do not issue blanket developer certifications).
4. Assert unverified recognitions (e.g., "Startup India Recognized" or "DPIIT Certified") unless an official certificate number has been issued by DPIIT and verified by the owner.
5. Present specific statutory retention numbers (such as "7 years under Section 128") as universal requirements across all entities and record types.

---

## 5. Summary of Immediate Owner / Professional Advisor Actions

1. **Chartered Accountant (CA):**
   - Review gross annual turnover across affiliate commissions and Premium subscription sales.
   - Confirm whether GST registration threshold (₹20 Lakh) applies, or if inter-State digital service supplies require immediate GSTIN registration.
   - Establish annual tax filing calendar (Income Tax Act / advance tax schedule).
2. **Company Secretary (CS) / Legal Counsel:**
   - Formalize business entity structure (Proprietorship / LLP / Private Limited).
   - Review terms of service and DPDP Act readiness once MeitY issues detailed operating rules.
3. **Business Owner:**
   - Designate and publish the formal physical registered office address and customer support phone number on the `/contact` and `/terms` pages.
