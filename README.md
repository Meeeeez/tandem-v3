## Email Setup

**Receiving:** `info@airadventure.it` → forwarded via ImprovMX (MX records) → airadventure420@gmail.com

**Sending:** Via AWS SES, authenticated with domain-specific DKIM (Easy DKIM, 3 CNAMEs) + SPF (`amazonses.com`) so mail passes DMARC as `airadventure.it`. Called directly from Lambda via `@aws-sdk/client-sesv2` (IAM `ses:SendEmail` permission), no API key needed.

**DNS records:**
- `MX` → ImprovMX (receiving)
- `TXT (SPF)` → `v=spf1 include:spf.improvmx.com include:amazonses.com ~all`
- `TXT (DMARC)` → `p=none` (was `quarantine`, relaxed due to earlier alignment issues)
- 3x `CNAME` → SES Easy DKIM records (`*._domainkey`)

**Booking form → email flow:**
`Form (airadventure.it)` → `fetch POST` → `book.airadventure.it` (API Gateway HTTP API, custom domain + ACM cert) → Lambda (validates input, escapes HTML) → AWS SES → `info@airadventure.it`