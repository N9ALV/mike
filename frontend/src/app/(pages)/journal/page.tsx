"use client";

import { FormEvent, useEffect, useState } from "react";
import { ClipboardList, Plus, Save, Trash2 } from "lucide-react";
import {
    createDecisionJournalEntry,
    deleteDecisionJournalEntry,
    listDecisionJournalEntries,
    listInvestmentTheses,
    listProjects,
    updateDecisionJournalEntry,
} from "@/app/lib/mikeApi";
import type {
    DecisionJournalEntry,
    InvestmentThesis,
    JournalAction,
    MikeProject,
} from "@/app/components/shared/types";

const ACTIONS: JournalAction[] = [
    "buy",
    "sell",
    "trim",
    "add",
    "hold",
    "avoid",
    "watch",
];

const EMPTY_FORM = {
    decision_date: new Date().toISOString().slice(0, 10),
    asset_name: "",
    action: "watch" as JournalAction,
    project_id: "",
    thesis_id: "",
    rationale_md: "",
    valuation_view_md: "",
    risks_md: "",
    disconfirming_evidence_md: "",
    position_sizing_md: "",
    review_date: "",
    confidence_score: "",
    outcome_md: "",
};

export default function JournalPage() {
    const [projects, setProjects] = useState<MikeProject[]>([]);
    const [theses, setTheses] = useState<InvestmentThesis[]>([]);
    const [entries, setEntries] = useState<DecisionJournalEntry[]>([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh() {
        setLoading(true);
        setError(null);
        try {
            const [projectData, thesisData, entryData] = await Promise.all([
                listProjects().catch(() => []),
                listInvestmentTheses().catch(() => []),
                listDecisionJournalEntries(),
            ]);
            setProjects(projectData);
            setTheses(thesisData);
            setEntries(entryData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load decision journal",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    function resetForm() {
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    function editEntry(entry: DecisionJournalEntry) {
        setEditingId(entry.id);
        setForm({
            decision_date: entry.decision_date,
            asset_name: entry.asset_name ?? "",
            action: entry.action,
            project_id: entry.project_id ?? "",
            thesis_id: entry.thesis_id ?? "",
            rationale_md: entry.rationale_md,
            valuation_view_md: entry.valuation_view_md ?? "",
            risks_md: entry.risks_md ?? "",
            disconfirming_evidence_md:
                entry.disconfirming_evidence_md ?? "",
            position_sizing_md: entry.position_sizing_md ?? "",
            review_date: entry.review_date ?? "",
            confidence_score: entry.confidence_score?.toString() ?? "",
            outcome_md: entry.outcome_md ?? "",
        });
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const payload = {
            ...form,
            project_id: form.project_id || null,
            thesis_id: form.thesis_id || null,
            asset_name: form.asset_name || null,
            valuation_view_md: form.valuation_view_md || null,
            risks_md: form.risks_md || null,
            disconfirming_evidence_md:
                form.disconfirming_evidence_md || null,
            position_sizing_md: form.position_sizing_md || null,
            review_date: form.review_date || null,
            confidence_score: form.confidence_score
                ? Number(form.confidence_score)
                : null,
            outcome_md: form.outcome_md || null,
        };

        try {
            if (editingId) {
                const updated = await updateDecisionJournalEntry(
                    editingId,
                    payload,
                );
                setEntries((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item,
                    ),
                );
            } else {
                const created = await createDecisionJournalEntry(payload);
                setEntries((current) => [created, ...current]);
            }
            resetForm();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save journal entry",
            );
        } finally {
            setSaving(false);
        }
    }

    async function remove(entryId: string) {
        setError(null);
        try {
            await deleteDecisionJournalEntry(entryId);
            setEntries((current) =>
                current.filter((item) => item.id !== entryId),
            );
            if (editingId === entryId) resetForm();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete journal entry",
            );
        }
    }

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[420px_1fr]">
                <section className="lg:sticky lg:top-8 lg:self-start">
                    <div className="mb-5 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-gray-700" />
                        <div>
                            <h1 className="text-2xl font-serif font-medium text-gray-950">
                                Decision journal
                            </h1>
                            <p className="text-sm text-gray-500">
                                Record the decision before the outcome is known.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={(event) => void submit(event)}
                        className="space-y-3 rounded-md border border-gray-200 p-4"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Decision date"
                                type="date"
                                value={form.decision_date}
                                onChange={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        decision_date: value,
                                    }))
                                }
                                required
                            />
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-gray-700">
                                    Action
                                </span>
                                <select
                                    value={form.action}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            action: event.target
                                                .value as JournalAction,
                                        }))
                                    }
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm capitalize outline-none focus:border-gray-500"
                                >
                                    {ACTIONS.map((action) => (
                                        <option key={action} value={action}>
                                            {action}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <Input
                            label="Asset"
                            value={form.asset_name}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    asset_name: value,
                                }))
                            }
                            placeholder="Company, fund, deal, portfolio"
                        />
                        <label className="block text-sm">
                            <span className="mb-1 block font-medium text-gray-700">
                                Workspace
                            </span>
                            <select
                                value={form.project_id}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        project_id: event.target.value,
                                    }))
                                }
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="">None</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block text-sm">
                            <span className="mb-1 block font-medium text-gray-700">
                                Linked thesis
                            </span>
                            <select
                                value={form.thesis_id}
                                onChange={(event) => {
                                    const thesis = theses.find(
                                        (item) =>
                                            item.id === event.target.value,
                                    );
                                    setForm((current) => ({
                                        ...current,
                                        thesis_id: event.target.value,
                                        asset_name:
                                            current.asset_name ||
                                            thesis?.asset_name ||
                                            "",
                                        project_id:
                                            current.project_id ||
                                            thesis?.project_id ||
                                            "",
                                    }));
                                }}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
                            >
                                <option value="">None</option>
                                {theses.map((thesis) => (
                                    <option key={thesis.id} value={thesis.id}>
                                        {thesis.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <TextArea
                            label="Rationale"
                            value={form.rationale_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    rationale_md: value,
                                }))
                            }
                            required
                        />
                        <TextArea
                            label="Valuation view"
                            value={form.valuation_view_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    valuation_view_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Risks"
                            value={form.risks_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    risks_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Disconfirming evidence"
                            value={form.disconfirming_evidence_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    disconfirming_evidence_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Position sizing"
                            value={form.position_sizing_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    position_sizing_md: value,
                                }))
                            }
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Review date"
                                type="date"
                                value={form.review_date}
                                onChange={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        review_date: value,
                                    }))
                                }
                            />
                            <Input
                                label="Confidence"
                                type="number"
                                min="1"
                                max="10"
                                value={form.confidence_score}
                                onChange={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        confidence_score: value,
                                    }))
                                }
                            />
                        </div>
                        <TextArea
                            label="Outcome"
                            value={form.outcome_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    outcome_md: value,
                                }))
                            }
                        />
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                            >
                                {editingId ? (
                                    <Save className="h-4 w-4" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                {editingId ? "Update entry" : "Log decision"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="h-9 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-950">
                            Journal entries
                        </h2>
                        <span className="text-sm text-gray-500">
                            {loading ? "Loading..." : `${entries.length} total`}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100 border-y border-gray-200">
                        {entries.length === 0 && !loading ? (
                            <div className="py-8 text-sm text-gray-500">
                                No decision records yet.
                            </div>
                        ) : (
                            entries.map((entry) => (
                                <article
                                    key={entry.id}
                                    className="grid gap-3 py-5 lg:grid-cols-[110px_1fr_80px]"
                                >
                                    <button
                                        type="button"
                                        onClick={() => editEntry(entry)}
                                        className="text-left text-sm text-gray-500"
                                    >
                                        {entry.decision_date}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editEntry(entry)}
                                        className="min-w-0 text-left"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium text-gray-950">
                                                {entry.asset_name ||
                                                    "Unnamed asset"}
                                            </h3>
                                            <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                                                {entry.action}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                                            {entry.rationale_md}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {entry.review_date
                                                ? `Review ${entry.review_date}`
                                                : "No review date"}
                                            {entry.confidence_score
                                                ? ` | Confidence ${entry.confidence_score}/10`
                                                : ""}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void remove(entry.id)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    required,
    placeholder,
    min,
    max,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
    min?: string;
    max?: string;
}) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
                {label}
            </span>
            <input
                type={type}
                required={required}
                value={value}
                min={min}
                max={max}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500"
            />
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
                {label}
            </span>
            <textarea
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
        </label>
    );
}
