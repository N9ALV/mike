export const BUILTIN_WORKFLOWS: { id: string; title: string; prompt_md: string }[] = [
    {
        id: "builtin-investment-memo",
        title: "Investment Memo",
        prompt_md:
            "## Investment Memo\n\n" +
            "Create a cited investment memo from the available source documents and any explicit user-provided assumptions. " +
            "Use uploaded documents as primary evidence. Do not invent financial metrics, prices, valuation multiples, holdings, or market data. " +
            "If important data is missing, state that clearly and leave a labelled gap or assumption.\n\n" +
            "You MUST use the generate_docx tool to produce the memo as a downloadable Word document. " +
            "Do not display the full memo inline.\n\n" +
            "Structure the document with these sections:\n" +
            "1. Executive summary\n" +
            "2. Asset or opportunity overview\n" +
            "3. Source base and data limitations\n" +
            "4. Bull case\n" +
            "5. Base case\n" +
            "6. Bear case\n" +
            "7. Key risks\n" +
            "8. Disconfirming evidence\n" +
            "9. Valuation view and assumptions\n" +
            "10. Kill criteria\n" +
            "11. Decision considerations\n" +
            "12. Review triggers and follow-up questions\n\n" +
            "For factual claims based on uploaded documents, cite exact source text in your chat response after reading the generated memo. " +
            "Keep the chat response short and describe what the generated memo contains.",
    },
    {
        id: "builtin-company-research",
        title: "Public Company Research",
        prompt_md:
            "## Public Company Research\n\n" +
            "Analyse the selected company using the available filings, transcripts, presentations, reports, and user-provided context. " +
            "Separate facts from assumptions and do not use model memory for current prices, recent financials, or live market data.\n\n" +
            "Cover:\n" +
            "- business model and revenue drivers\n" +
            "- segment or product exposure\n" +
            "- unit economics, margins, and cash generation where sourced\n" +
            "- balance-sheet strength where sourced\n" +
            "- management quality and capital allocation evidence\n" +
            "- moat and competitive position\n" +
            "- customer, geographic, regulatory, and technology risks\n" +
            "- bull, base, and bear case\n" +
            "- key metrics to verify with deterministic data tools later\n" +
            "- disconfirming evidence and kill criteria\n\n" +
            "Return the analysis inline unless the user asks for a downloadable memo. Cite uploaded documents for factual claims.",
    },
    {
        id: "builtin-portfolio-review",
        title: "Portfolio Review",
        prompt_md:
            "## Portfolio Review\n\n" +
            "Review uploaded broker statements, portfolio reports, fund documents, or user-provided holdings. " +
            "Do not invent holdings, prices, performance, asset allocation, or returns. If the source documents do not contain a number, mark it as unavailable.\n\n" +
            "Cover:\n" +
            "- holdings and asset classes found in the source material\n" +
            "- concentration risks\n" +
            "- currency, sector, geography, and liquidity exposures where stated\n" +
            "- cash percentage where stated\n" +
            "- income or dividend exposure where stated\n" +
            "- gaps in the available records\n" +
            "- rebalancing questions to investigate\n" +
            "- follow-up documents or data needed\n\n" +
            "Return a concise review with citations. Frame any action discussion as research support, not personal advice.",
    },
    {
        id: "builtin-decision-journal",
        title: "Decision Journal Entry",
        prompt_md:
            "## Decision Journal Entry\n\n" +
            "Help the user turn the current research into a structured decision journal entry. " +
            "Do not tell the user what to do. Capture the decision logic, assumptions, risks, and follow-up plan.\n\n" +
            "Include:\n" +
            "- decision date\n" +
            "- asset, security, fund, portfolio, or deal\n" +
            "- action: buy, sell, trim, add, hold, avoid, or watch\n" +
            "- thesis\n" +
            "- variant perception\n" +
            "- valuation view\n" +
            "- expected return range if explicitly provided by the user or sources\n" +
            "- time horizon\n" +
            "- key risks\n" +
            "- disconfirming evidence\n" +
            "- kill criteria\n" +
            "- position-sizing rationale\n" +
            "- confidence score if the user gives one\n" +
            "- review date\n\n" +
            "Return the entry inline in Markdown. Cite source documents where factual claims depend on them.",
    },
];
