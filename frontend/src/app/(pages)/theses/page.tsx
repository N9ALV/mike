"use client";

import { FormEvent, useEffect, useState } from "react";
import { BookOpenCheck, Plus, Save, Trash2 } from "lucide-react";
import {
    createInvestmentThesis,
    deleteInvestmentThesis,
    listInvestmentTheses,
    listProjects,
    updateInvestmentThesis,
} from "@/app/lib/mikeApi";
import type {
    InvestmentThesis,
    MikeProject,
    ThesisStatus,
} from "@/app/components/shared/types";

const STATUSES: ThesisStatus[] = ["active", "watching", "closed", "archived"];

const EMPTY_FORM = {
    title: "",
    asset_name: "",
    project_id: "",
    thesis_md: "",
    bull_case_md: "",
    base_case_md: "",
    bear_case_md: "",
    key_risks_md: "",
    kill_criteria_md: "",
    time_horizon: "",
    confidence_score: "",
    status: "active" as ThesisStatus,
    review_date: "",
};

export default function ThesesPage() {
    const [projects, setProjects] = useState<MikeProject[]>([]);
    const [theses, setTheses] = useState<InvestmentThesis[]>([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh() {
        setLoading(true);
        setError(null);
        try {
            const [projectData, thesisData] = await Promise.all([
                listProjects().catch(() => []),
                listInvestmentTheses(),
            ]);
            setProjects(projectData);
            setTheses(thesisData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load theses",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingId(null);
    }

    function editThesis(thesis: InvestmentThesis) {
        setEditingId(thesis.id);
        setForm({
            title: thesis.title,
            asset_name: thesis.asset_name ?? "",
            project_id: thesis.project_id ?? "",
            thesis_md: thesis.thesis_md,
            bull_case_md: thesis.bull_case_md ?? "",
            base_case_md: thesis.base_case_md ?? "",
            bear_case_md: thesis.bear_case_md ?? "",
            key_risks_md: thesis.key_risks_md ?? "",
            kill_criteria_md: thesis.kill_criteria_md ?? "",
            time_horizon: thesis.time_horizon ?? "",
            confidence_score: thesis.confidence_score?.toString() ?? "",
            status: thesis.status,
            review_date: thesis.review_date ?? "",
        });
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const payload = {
            ...form,
            project_id: form.project_id || null,
            asset_name: form.asset_name || null,
            bull_case_md: form.bull_case_md || null,
            base_case_md: form.base_case_md || null,
            bear_case_md: form.bear_case_md || null,
            key_risks_md: form.key_risks_md || null,
            kill_criteria_md: form.kill_criteria_md || null,
            time_horizon: form.time_horizon || null,
            review_date: form.review_date || null,
            confidence_score: form.confidence_score
                ? Number(form.confidence_score)
                : null,
        };

        try {
            if (editingId) {
                const updated = await updateInvestmentThesis(editingId, payload);
                setTheses((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item,
                    ),
                );
            } else {
                const created = await createInvestmentThesis(payload);
                setTheses((current) => [created, ...current]);
            }
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save thesis");
        } finally {
            setSaving(false);
        }
    }

    async function remove(thesisId: string) {
        setError(null);
        try {
            await deleteInvestmentThesis(thesisId);
            setTheses((current) =>
                current.filter((item) => item.id !== thesisId),
            );
            if (editingId === thesisId) resetForm();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete thesis",
            );
        }
    }

    return (
        <div className="h-full overflow-y-auto bg-white">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[420px_1fr]">
                <section className="lg:sticky lg:top-8 lg:self-start">
                    <div className="mb-5 flex items-center gap-2">
                        <BookOpenCheck className="h-5 w-5 text-gray-700" />
                        <div>
                            <h1 className="text-2xl font-serif font-medium text-gray-950">
                                Thesis register
                            </h1>
                            <p className="text-sm text-gray-500">
                                Track assumptions, risks, and review triggers.
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
                        <Input
                            label="Title"
                            value={form.title}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    title: value,
                                }))
                            }
                            required
                        />
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
                        <TextArea
                            label="Thesis"
                            value={form.thesis_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    thesis_md: value,
                                }))
                            }
                            required
                        />
                        <TextArea
                            label="Bull case"
                            value={form.bull_case_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    bull_case_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Bear case"
                            value={form.bear_case_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    bear_case_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Key risks"
                            value={form.key_risks_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    key_risks_md: value,
                                }))
                            }
                        />
                        <TextArea
                            label="Kill criteria"
                            value={form.kill_criteria_md}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    kill_criteria_md: value,
                                }))
                            }
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Time horizon"
                                value={form.time_horizon}
                                onChange={(value) =>
                                    setForm((current) => ({
                                        ...current,
                                        time_horizon: value,
                                    }))
                                }
                            />
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
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-gray-700">
                                    Status
                                </span>
                                <select
                                    value={form.status}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            status: event.target
                                                .value as ThesisStatus,
                                        }))
                                    }
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm capitalize outline-none focus:border-gray-500"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
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
                                {editingId ? "Update thesis" : "Add thesis"}
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
                            Saved theses
                        </h2>
                        <span className="text-sm text-gray-500">
                            {loading ? "Loading..." : `${theses.length} total`}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100 border-y border-gray-200">
                        {theses.length === 0 && !loading ? (
                            <div className="py-8 text-sm text-gray-500">
                                No saved theses yet.
                            </div>
                        ) : (
                            theses.map((thesis) => (
                                <article
                                    key={thesis.id}
                                    className="grid gap-3 py-5 lg:grid-cols-[1fr_150px_80px]"
                                >
                                    <button
                                        type="button"
                                        onClick={() => editThesis(thesis)}
                                        className="min-w-0 text-left"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium text-gray-950">
                                                {thesis.title}
                                            </h3>
                                            <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                                                {thesis.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {thesis.asset_name || "No asset"}{" "}
                                            {thesis.review_date
                                                ? `| Review ${thesis.review_date}`
                                                : ""}
                                        </p>
                                        <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                                            {thesis.thesis_md}
                                        </p>
                                    </button>
                                    <div className="text-sm text-gray-500">
                                        {thesis.confidence_score
                                            ? `Confidence ${thesis.confidence_score}/10`
                                            : "No score"}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void remove(thesis.id)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Delete thesis"
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
