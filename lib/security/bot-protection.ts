/**
 * Bot protection: Honeypot trap verification & automated crawler detection.
 */

// Honeypot fields that should always remain empty if submitted by humans
const HONEYPOT_FIELD_NAMES = ["_gotcha", "website_url_hp", "phone_check_trap", "_hp"] as const;

const KNOWN_ATTACK_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /zgrab/i,
  /masscan/i,
  /gobuster/i,
  /dirbuster/i,
];

export interface BotCheckResult {
  isBot: boolean;
  reason?: string;
}

/**
 * Checks request payload for honeypot fields and suspicious crawler signatures.
 */
export function checkBotSubmission(body: unknown, headers?: Headers): BotCheckResult {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const field of HONEYPOT_FIELD_NAMES) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== "") {
        return {
          isBot: true,
          reason: `Honeypot field "${field}" was filled.`,
        };
      }
    }
  }

  if (headers) {
    const userAgent = headers.get("user-agent") || "";
    for (const attackAgent of KNOWN_ATTACK_AGENTS) {
      if (attackAgent.test(userAgent)) {
        return {
          isBot: true,
          reason: "Automated vulnerability scanner user-agent detected.",
        };
      }
    }
  }

  return { isBot: false };
}
