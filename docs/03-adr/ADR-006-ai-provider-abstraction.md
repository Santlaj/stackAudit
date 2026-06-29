# ADR-006: AI Provider Abstraction

## Status

Accepted

---

## Context

StackAudit relies on AI for repository summaries and engineering insights.

Vendor lock-in should be avoided.

---

## Decision

Introduce an abstraction layer between StackAudit and AI providers.

Supported providers may include:

- OpenAI
- Google Gemini
- Anthropic Claude
- Self-hosted models (Future)

---

## Rationale

- Vendor independence
- Easier switching
- Better cost optimization
- Improved testing

---

## Alternatives

### Direct OpenAI SDK Usage

Rejected because it tightly couples business logic to a single provider.

---

## Consequences

Positive

- Flexible architecture
- Future-proof integrations

Negative

- Slightly more implementation effort