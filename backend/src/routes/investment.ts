import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createServerSupabase } from "../lib/supabase";
import { checkProjectAccess, listAccessibleProjectIds } from "../lib/access";

export const investmentRouter = Router();

type Db = ReturnType<typeof createServerSupabase>;

const THESIS_STATUS = new Set(["active", "watching", "closed", "archived"]);
const JOURNAL_ACTIONS = new Set([
    "buy",
    "sell",
    "trim",
    "add",
    "hold",
    "avoid",
    "watch",
]);

function cleanString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

function cleanScore(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const score = Number(value);
    if (!Number.isInteger(score) || score < 1 || score > 10) return null;
    return score;
}

function cleanDate(value: unknown): string | null {
    const text = cleanString(value);
    if (!text) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function accessibleProjectFilter(userId: string, projectIds: string[]) {
    if (projectIds.length === 0) return `user_id.eq.${userId}`;
    return `user_id.eq.${userId},project_id.in.(${projectIds.join(",")})`;
}

async function assertProjectReadable(
    db: Db,
    projectId: string | null,
    userId: string,
    userEmail: string | undefined,
) {
    if (!projectId) return true;
    const access = await checkProjectAccess(projectId, userId, userEmail, db);
    return access.ok;
}

async function canReadRow(
    db: Db,
    row: { user_id: string; project_id: string | null },
    userId: string,
    userEmail: string | undefined,
) {
    if (row.user_id === userId) return true;
    if (!row.project_id) return false;
    const access = await checkProjectAccess(row.project_id, userId, userEmail, db);
    return access.ok;
}

// GET /investment/overview
investmentRouter.get("/overview", requireAuth, async (_req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const db = createServerSupabase();
    const projectIds = await listAccessibleProjectIds(userId, userEmail, db);
    const filter = accessibleProjectFilter(userId, projectIds);
    const today = new Date().toISOString().slice(0, 10);

    const [theses, journal] = await Promise.all([
        db
            .from("investment_theses")
            .select("id, status, review_date")
            .or(filter),
        db
            .from("decision_journal_entries")
            .select("id, review_date")
            .or(filter),
    ]);

    if (theses.error)
        return void res.status(500).json({ detail: theses.error.message });
    if (journal.error)
        return void res.status(500).json({ detail: journal.error.message });

    const thesisRows = theses.data ?? [];
    const journalRows = journal.data ?? [];

    res.json({
        thesis_count: thesisRows.length,
        active_thesis_count: thesisRows.filter((t) => t.status === "active")
            .length,
        journal_count: journalRows.length,
        review_due_count:
            thesisRows.filter((t) => t.review_date && t.review_date <= today)
                .length +
            journalRows.filter((j) => j.review_date && j.review_date <= today)
                .length,
    });
});

// GET /investment/theses
investmentRouter.get("/theses", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const projectId = cleanString(req.query.project_id);
    const db = createServerSupabase();

    let query = db
        .from("investment_theses")
        .select("*")
        .order("updated_at", { ascending: false });

    if (projectId) {
        const ok = await assertProjectReadable(db, projectId, userId, userEmail);
        if (!ok) return void res.status(404).json({ detail: "Project not found" });
        query = query.eq("project_id", projectId);
    } else {
        const projectIds = await listAccessibleProjectIds(userId, userEmail, db);
        query = query.or(accessibleProjectFilter(userId, projectIds));
    }

    const { data, error } = await query;
    if (error) return void res.status(500).json({ detail: error.message });
    res.json(data ?? []);
});

// POST /investment/theses
investmentRouter.post("/theses", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const db = createServerSupabase();

    const title = cleanString(req.body.title);
    const thesis = cleanString(req.body.thesis_md);
    const projectId = cleanString(req.body.project_id);
    if (!title) return void res.status(400).json({ detail: "title is required" });
    if (!thesis)
        return void res.status(400).json({ detail: "thesis_md is required" });
    if (!(await assertProjectReadable(db, projectId, userId, userEmail))) {
        return void res.status(404).json({ detail: "Project not found" });
    }

    const status = cleanString(req.body.status) ?? "active";
    const { data, error } = await db
        .from("investment_theses")
        .insert({
            user_id: userId,
            project_id: projectId,
            security_id: cleanString(req.body.security_id),
            title,
            asset_name: cleanString(req.body.asset_name),
            thesis_md: thesis,
            bull_case_md: cleanString(req.body.bull_case_md),
            base_case_md: cleanString(req.body.base_case_md),
            bear_case_md: cleanString(req.body.bear_case_md),
            key_risks_md: cleanString(req.body.key_risks_md),
            kill_criteria_md: cleanString(req.body.kill_criteria_md),
            time_horizon: cleanString(req.body.time_horizon),
            confidence_score: cleanScore(req.body.confidence_score),
            status: THESIS_STATUS.has(status) ? status : "active",
            review_date: cleanDate(req.body.review_date),
        })
        .select("*")
        .single();

    if (error) return void res.status(500).json({ detail: error.message });
    res.status(201).json(data);
});

// GET /investment/theses/:thesisId
investmentRouter.get("/theses/:thesisId", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const db = createServerSupabase();
    const { data, error } = await db
        .from("investment_theses")
        .select("*")
        .eq("id", req.params.thesisId)
        .single();
    if (error || !data)
        return void res.status(404).json({ detail: "Thesis not found" });
    if (!(await canReadRow(db, data, userId, userEmail)))
        return void res.status(404).json({ detail: "Thesis not found" });
    res.json(data);
});

// PATCH /investment/theses/:thesisId
investmentRouter.patch("/theses/:thesisId", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const db = createServerSupabase();
    const updates: Record<string, unknown> = {};

    for (const key of [
        "title",
        "asset_name",
        "thesis_md",
        "bull_case_md",
        "base_case_md",
        "bear_case_md",
        "key_risks_md",
        "kill_criteria_md",
        "time_horizon",
    ]) {
        if (req.body[key] !== undefined) updates[key] = cleanString(req.body[key]);
    }
    if (req.body.confidence_score !== undefined)
        updates.confidence_score = cleanScore(req.body.confidence_score);
    if (req.body.review_date !== undefined)
        updates.review_date = cleanDate(req.body.review_date);
    if (req.body.status !== undefined) {
        const status = cleanString(req.body.status);
        if (status && THESIS_STATUS.has(status)) updates.status = status;
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
        .from("investment_theses")
        .update(updates)
        .eq("id", req.params.thesisId)
        .eq("user_id", userId)
        .select("*")
        .single();

    if (error || !data)
        return void res.status(404).json({ detail: "Thesis not found" });
    res.json(data);
});

// DELETE /investment/theses/:thesisId
investmentRouter.delete("/theses/:thesisId", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const db = createServerSupabase();
    const { error } = await db
        .from("investment_theses")
        .delete()
        .eq("id", req.params.thesisId)
        .eq("user_id", userId);
    if (error) return void res.status(500).json({ detail: error.message });
    res.status(204).send();
});

// GET /investment/journal
investmentRouter.get("/journal", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const projectId = cleanString(req.query.project_id);
    const db = createServerSupabase();

    let query = db
        .from("decision_journal_entries")
        .select("*")
        .order("decision_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (projectId) {
        const ok = await assertProjectReadable(db, projectId, userId, userEmail);
        if (!ok) return void res.status(404).json({ detail: "Project not found" });
        query = query.eq("project_id", projectId);
    } else {
        const projectIds = await listAccessibleProjectIds(userId, userEmail, db);
        query = query.or(accessibleProjectFilter(userId, projectIds));
    }

    const { data, error } = await query;
    if (error) return void res.status(500).json({ detail: error.message });
    res.json(data ?? []);
});

// POST /investment/journal
investmentRouter.post("/journal", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const userEmail = res.locals.userEmail as string | undefined;
    const db = createServerSupabase();

    const action = cleanString(req.body.action)?.toLowerCase();
    const rationale = cleanString(req.body.rationale_md);
    const projectId = cleanString(req.body.project_id);
    if (!action || !JOURNAL_ACTIONS.has(action)) {
        return void res.status(400).json({ detail: "valid action is required" });
    }
    if (!rationale) {
        return void res
            .status(400)
            .json({ detail: "rationale_md is required" });
    }
    if (!(await assertProjectReadable(db, projectId, userId, userEmail))) {
        return void res.status(404).json({ detail: "Project not found" });
    }

    const { data, error } = await db
        .from("decision_journal_entries")
        .insert({
            user_id: userId,
            project_id: projectId,
            portfolio_id: cleanString(req.body.portfolio_id),
            security_id: cleanString(req.body.security_id),
            thesis_id: cleanString(req.body.thesis_id),
            decision_date:
                cleanDate(req.body.decision_date) ??
                new Date().toISOString().slice(0, 10),
            asset_name: cleanString(req.body.asset_name),
            action,
            rationale_md: rationale,
            valuation_view_md: cleanString(req.body.valuation_view_md),
            risks_md: cleanString(req.body.risks_md),
            disconfirming_evidence_md: cleanString(
                req.body.disconfirming_evidence_md,
            ),
            position_sizing_md: cleanString(req.body.position_sizing_md),
            review_date: cleanDate(req.body.review_date),
            confidence_score: cleanScore(req.body.confidence_score),
            outcome_md: cleanString(req.body.outcome_md),
        })
        .select("*")
        .single();

    if (error) return void res.status(500).json({ detail: error.message });
    res.status(201).json(data);
});

// PATCH /investment/journal/:entryId
investmentRouter.patch("/journal/:entryId", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const db = createServerSupabase();
    const updates: Record<string, unknown> = {};

    for (const key of [
        "asset_name",
        "rationale_md",
        "valuation_view_md",
        "risks_md",
        "disconfirming_evidence_md",
        "position_sizing_md",
        "outcome_md",
    ]) {
        if (req.body[key] !== undefined) updates[key] = cleanString(req.body[key]);
    }
    if (req.body.action !== undefined) {
        const action = cleanString(req.body.action)?.toLowerCase();
        if (action && JOURNAL_ACTIONS.has(action)) updates.action = action;
    }
    if (req.body.decision_date !== undefined)
        updates.decision_date = cleanDate(req.body.decision_date);
    if (req.body.review_date !== undefined)
        updates.review_date = cleanDate(req.body.review_date);
    if (req.body.confidence_score !== undefined)
        updates.confidence_score = cleanScore(req.body.confidence_score);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
        .from("decision_journal_entries")
        .update(updates)
        .eq("id", req.params.entryId)
        .eq("user_id", userId)
        .select("*")
        .single();

    if (error || !data)
        return void res.status(404).json({ detail: "Journal entry not found" });
    res.json(data);
});

// DELETE /investment/journal/:entryId
investmentRouter.delete("/journal/:entryId", requireAuth, async (req, res) => {
    const userId = res.locals.userId as string;
    const db = createServerSupabase();
    const { error } = await db
        .from("decision_journal_entries")
        .delete()
        .eq("id", req.params.entryId)
        .eq("user_id", userId);
    if (error) return void res.status(500).json({ detail: error.message });
    res.status(204).send();
});
