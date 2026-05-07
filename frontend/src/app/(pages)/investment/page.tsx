"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    BarChart3,
    BookOpenCheck,
    ClipboardList,
    FileText,
    FolderOpen,
    Library,
    Table2,
} from "lucide-react";
import {
    getInvestmentOverview,
    listDecisionJournalEntries,
    listInvestmentTheses,
} from "@/app/lib/mikeApi";
import type {
    DecisionJournalEntry,
    InvestmentOverview,
    InvestmentThesis,
} from "@/app/components/shared/types";

const WORKFLOW_LINKS = [
    { href: "/projects", label: "Research workspaces", Icon: FolderOpen },
    { href: "/workflows", label: "Playbooks", Icon: Library },
    { href: "/tabular-reviews", label: "Research matrices", Icon: Table2 },
    { href: "/assistant", label: "Assistant", Icon: FileText },
];

const BETA_MODULES = [
    "Market data tools",
    "Portfolio holdings",
    "Allocation dashboard",
    "Review reminders",
];

export default function InvestmentPage() {
    const [overview, setOverview] = useState<InvestmentOverview | null>(null);
    const [theses, setTheses] = useState<InvestmentThesis[]>([]);
    const [journal, setJournal] = useState<DecisionJournalEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            getInvestmentOverview(),
            listInvestmentTheses(),
            listDecisionJournalEntries(),
        ])
            .then(([overviewData, thesisData, journalData]) => {
                if (cancelled) return;
                setOverview(overviewData);
                setTheses(thesisData);
                setJournal(journalData);
            })
            .catch((err) => {
                if (!cancelled)
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load investment workspace",
                    );
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const latestTheses = theses.slice(0, 4);
    const latestJournal = journal.slice(0, 4);

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <BarChart3 className="h-4 w-4" />
                            Investment research workspace
                        </div>
                        <h1 className="text-3xl font-serif font-medium text-gray-950">
                            Research operating system
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/theses"
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <BookOpenCheck className="h-4 w-4" />
                            New thesis
                        </Link>
                        <Link
                            href="/journal"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Log decision
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Research support only. Outputs are educational frameworks
                    and source-backed analysis, not personalised financial,
                    tax, or legal advice.
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Metric
                        label="Theses"
                        value={overview?.thesis_count ?? theses.length}
                    />
                    <Metric
                        label="Active"
                        value={
                            overview?.active_thesis_count ??
                            theses.filter((t) => t.status === "active").length
                        }
                    />
                    <Metric
                        label="Journal entries"
                        value={overview?.journal_count ?? journal.length}
                    />
                    <Metric
                        label="Reviews due"
                        value={overview?.review_due_count ?? 0}
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <section className="min-w-0">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-950">
                                Current theses
                            </h2>
                            <Link
                                href="/theses"
                                className="text-sm font-medium text-gray-600 hover:text-gray-950"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100 border-y border-gray-200">
                            {latestTheses.length === 0 ? (
                                <EmptyRow text="No theses yet. Start with a company, fund, deal, or portfolio idea." />
                            ) : (
                                latestTheses.map((thesis) => (
                                    <div
                                        key={thesis.id}
                                        className="grid gap-2 py-4 md:grid-cols-[1fr_160px_120px]"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-gray-950">
                                                {thesis.title}
                                            </div>
                                            <div className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                {thesis.thesis_md}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {thesis.asset_name || "No asset"}
                                        </div>
                                        <div className="text-sm capitalize text-gray-500">
                                            {thesis.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <aside className="flex flex-col gap-6">
                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-gray-950">
                                Research loop
                            </h2>
                            <div className="grid gap-2">
                                {WORKFLOW_LINKS.map(({ href, label, Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="flex h-11 items-center gap-3 rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
                                    >
                                        <Icon className="h-4 w-4 text-gray-500" />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-gray-950">
                                Beta queue
                            </h2>
                            <div className="divide-y divide-gray-100 border-y border-gray-200">
                                {BETA_MODULES.map((label) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between py-3 text-sm"
                                    >
                                        <span className="text-gray-700">
                                            {label}
                                        </span>
                                        <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                            Coming soon
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-950">
                            Recent decisions
                        </h2>
                        <Link
                            href="/journal"
                            className="text-sm font-medium text-gray-600 hover:text-gray-950"
                        >
                            View journal
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 border-y border-gray-200">
                        {latestJournal.length === 0 ? (
                            <EmptyRow text="No decision records yet." />
                        ) : (
                            latestJournal.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="grid gap-2 py-4 md:grid-cols-[120px_1fr_140px]"
                                >
                                    <div className="text-sm text-gray-500">
                                        {entry.decision_date}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-950">
                                            {entry.asset_name || "Unnamed asset"}
                                        </div>
                                        <div className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {entry.rationale_md}
                                        </div>
                                    </div>
                                    <div className="text-sm capitalize text-gray-500">
                                        {entry.action}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border border-gray-200 px-4 py-3">
            <div className="text-2xl font-semibold text-gray-950">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
        </div>
    );
}

function EmptyRow({ text }: { text: string }) {
    return <div className="py-6 text-sm text-gray-500">{text}</div>;
}
