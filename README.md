# BuyWise AI Super App

BuyWise is a comprehensive, AI-powered shopping and travel helper application with multi-platform price tracking, real-time deal discovery, and an intelligent personal shopper assistant.

---

## 🔒 Security Safety & Credential Pass

A full-scale security audit and safety pass has been successfully conducted on this codebase.

### Major Changes:
1. **Zero Hardcoded Secrets**: All private API keys, database URLs, and third-party tokens have been completely removed as literal strings from the source code.
2. **Environment Variables**: The application now strictly retrieves keys using standard environment variables:
   - **Client-Side**: Configured via Vite (`import.meta.env`) with safe `VITE_` prefixes (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
   - **Server-Side**: Secured via Node.js (`process.env`) for sensitive search keys and bot tokens (e.g., `SERP_API_KEY`, `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`).
3. **Template Environment Configuration**: Added `.env.example` defining all required configuration keys with description placeholders.
4. **Git Protection**: Ensured `.env` files are ignored in `.gitignore` to prevent secret leakage.

---

## ⚠️ CRITICAL SECURITY WARNING (Rotate Keys Immediately)

> [!CAUTION]
> **ROTATE PREVIOUSLY HARDCODED SECRETS IMMEDIATELY**:
> Because credentials (including Supabase anon key, SerpApi token, and Telegram bot token) were previously stored in early versions of the source code as string literals, **they still exist in the Git history**.
>
> To ensure the absolute safety and integrity of your external services, **you must immediately rotate these credentials**:
> - Rotate your **Supabase API keys and database tokens** via the Supabase Dashboard.
> - Regen/rotate your **SerpApi token** via SerpApi settings.
> - Revoke and generate a new token for your **Telegram bot** via Telegram's BotFather.
