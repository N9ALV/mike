import type { ColumnFormat } from "../shared/types";

export interface ColumnPreset {
    name: string;
    matches: RegExp;
    prompt: string;
    format: ColumnFormat;
    tags?: string[];
}

export const PROMPT_PRESETS: ColumnPreset[] = [
    {
        name: "Business Description",
        matches: /\bbusiness\b|\bdescription\b|\bmodel\b/i,
        format: "text",
        prompt: "Summarise the business model, main products or services, customer base, and revenue drivers using only the source document. Do not add unsourced market data.",
    },
    {
        name: "Revenue Growth",
        matches: /\brevenue\b|\bgrowth\b|\bsales\b/i,
        format: "text",
        prompt: "Extract revenue, sales, customer, volume, or segment growth evidence from the document. Include period references and figures only if explicitly stated. If not found, state Not Found.",
    },
    {
        name: "Margins",
        matches: /\bmargin\b|\bprofitability\b|\bebitda\b|\boperating income\b/i,
        format: "text",
        prompt: "Extract margin, profitability, EBITDA, operating income, or unit-economics commentary from the document. Include figures only if explicitly stated.",
    },
    {
        name: "Free Cash Flow",
        matches: /\bfree cash flow\b|\bfcf\b|\bcash generation\b/i,
        format: "text",
        prompt: "Extract free cash flow, operating cash flow, cash conversion, or cash generation commentary from the document. Include period and currency where stated.",
    },
    {
        name: "Balance Sheet",
        matches: /\bbalance sheet\b|\bdebt\b|\bcash\b|\bliquidity\b|\bleverage\b/i,
        format: "text",
        prompt: "Extract cash, debt, liquidity, leverage, or balance-sheet strength indicators from the document. Include period and currency where stated.",
    },
    {
        name: "Moat",
        matches: /\bmoat\b|\bcompetitive\b|\badvantage\b|\bswitching cost\b|\bnetwork effect\b/i,
        format: "text",
        prompt: "Identify evidence for competitive advantage, switching costs, scale, network effects, brand, cost advantage, intellectual property, or regulatory barriers.",
    },
    {
        name: "Bull Case",
        matches: /\bbull\b|\bupside\b/i,
        format: "text",
        prompt: "Summarise the strongest upside case supported by the document. Clearly mark assumptions and avoid unsupported price targets.",
    },
    {
        name: "Bear Case",
        matches: /\bbear\b|\bdownside\b/i,
        format: "text",
        prompt: "Summarise the strongest downside case supported by the document. Clearly mark assumptions and avoid unsupported price targets.",
    },
    {
        name: "Kill Criteria",
        matches: /\bkill criteria\b|\bthesis break\b|\bbreak.*thesis\b/i,
        format: "bulleted_list",
        prompt: "Identify evidence or conditions that would weaken or break the thesis. Use only source-supported points or explicit assumptions.",
    },
    {
        name: "Key Risks",
        matches: /\brisk\b|\brisks\b/i,
        format: "bulleted_list",
        prompt: "List the key risks stated or strongly evidenced in the document. Do not include generic risks unless they are supported by the source material.",
    },
    {
        name: "Parties",
        matches: /\bpart(y|ies)\b/i,
        format: "bulleted_list",
        prompt: 'List all parties to this agreement. For each party, state their full legal name, entity type, and defined role, e.g.:\n• ABC Corp, a Delaware corporation ("Company")\n• John Smith ("Shareholder")\nOne party per bullet. No additional commentary.',
    },
    {
        name: "Governing Law",
        matches: /\bgoverning law\b|\bjurisdiction\b/i,
        format: "text",
        prompt: 'State only the governing law of this agreement using the short-form jurisdiction name, e.g. "New York Law", "English Law", "Indian Law", "PRC Law". No other text.',
    },
    {
        name: "Effective Date",
        matches: /\beffective date\b/i,
        format: "date",
        prompt: 'State only the effective date of this agreement in DD Mon YYYY format, e.g. "2 Jan 2026". If not explicitly stated, write "Not specified".',
    },
    {
        name: "Term",
        matches: /\bterm\b|\bduration\b/i,
        format: "text",
        prompt: 'State only the duration or term of this agreement in a concise form, e.g. "3 years", "24 months", "perpetual". No other text.',
    },
    {
        name: "Termination",
        matches: /\bterminat(e|ion|ing)\b/i,
        format: "text",
        prompt: "Extract the termination provisions. State who may terminate, the trigger events, required notice period, any cure period, and the key consequences of termination. Be concise.",
    },
    {
        name: "Change of Control",
        matches: /\bchange of control\b/i,
        format: "text",
        prompt: "Identify any change of control provisions. Summarize the trigger events, consequences, consent requirements, and any related termination or acceleration rights. Be concise.",
    },
    {
        name: "Confidentiality",
        matches: /\bconfidential(ity)?\b|\bnon-?disclosure\b/i,
        format: "text",
        prompt: "Summarize the confidentiality obligations: scope of confidential information, permitted disclosures, use restrictions, duration, and key carve-outs or exceptions.",
    },
    {
        name: "Assignment",
        matches: /\bassign(ment|ability)?\b/i,
        format: "yes_no",
        prompt: "Is assignment of this agreement permitted without the other party's consent?",
    },
    {
        name: "Payment & Fees",
        matches: /\bpayment\b|\bfees?\b/i,
        format: "text",
        prompt: 'State the key payment obligations concisely: amount, timing, and currency, e.g. "USD 10,000 payable within 30 days of invoice". Note any late payment consequences.',
    },
    {
        name: "Amendment",
        matches: /\bamendment\b|\bvariation\b/i,
        format: "text",
        prompt: "Summarize the amendment provisions: how amendments may be made, who must consent, and any formality requirements such as writing or signature.",
    },
    {
        name: "Indemnity",
        matches: /\bindemni(ty|ties|fication)\b/i,
        format: "text",
        prompt: "Summarize the indemnity provisions: who indemnifies whom, the scope of indemnified losses, any liability caps or exclusions, and key claims procedures.",
    },
    {
        name: "Warranties",
        matches: /\bwarrant(y|ies|ing)\b|\brepresentations?\b/i,
        format: "text",
        prompt: "Identify and describe key representations and warranties provided by any party, including the scope of such assurances and any specific time periods or conditions applicable to them. In particular highlight any non-standard warranties.",
    },
    {
        name: "Force Majeure",
        matches: /\bforce majeure\b/i,
        format: "yes_no",
        prompt: "Does this agreement contain a force majeure clause?",
    },
];

export function getPresetConfig(
    title: string,
): Pick<ColumnPreset, "prompt" | "format" | "tags"> | null {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const preset = PROMPT_PRESETS.find(({ matches }) => matches.test(trimmed));
    if (!preset) return null;
    return { prompt: preset.prompt, format: preset.format, tags: preset.tags };
}

export function getPresetPrompt(title: string): string | null {
    return getPresetConfig(title)?.prompt ?? null;
}
