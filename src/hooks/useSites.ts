import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Site, User, EscalationEntry, ChecklistTask, RevisionSummary, FuelingChecklistTask, CMChecklistTask, WorkOrderChecklistTask } from "@/types/site";

// ─── BASE FETCH HELPERS ───────────────────────────────────────────────────────
const apiFetch = async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);
    return res.json();
};

const apiPost = async <T>(url: string, data: unknown): Promise<T> => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

const apiPut = async <T>(url: string, data: unknown): Promise<T> => {
    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

const apiDelete = async (url: string): Promise<{ message: string }> => {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// ─── SITES ────────────────────────────────────────────────────────────────────
export const useSites = () =>
    useQuery({ queryKey: ["sites"], queryFn: () => apiFetch<Site[]>("/api/sites"), staleTime: 1000 * 60 * 5 });

export const useCreateSite = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Site>) => apiPost<Site>("/api/sites", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
    });
};

export const useUpdateSite = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Site> }) =>
            apiPut<Site>(`/api/sites/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
    });
};

export const useDeleteSite = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/sites/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
    });
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const useUsers = () =>
    useQuery({ queryKey: ["users"], queryFn: () => apiFetch<User[]>("/api/users"), staleTime: 1000 * 60 * 10 });

export const useCreateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<User>) => apiPost<User>("/api/users", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
    });
};

export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            apiPut<User>(`/api/users/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
    });
};

export const useDeleteUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/users/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
    });
};

// ─── ESCALATIONS ──────────────────────────────────────────────────────────────
export const useEscalations = () =>
    useQuery({ queryKey: ["escalations"], queryFn: () => apiFetch<EscalationEntry[]>("/api/escalations"), staleTime: 1000 * 60 * 5 });

export const useCreateEscalation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<EscalationEntry>) => apiPost<EscalationEntry>("/api/escalations", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["escalations"] }),
    });
};

export const useUpdateEscalation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<EscalationEntry> }) =>
            apiPut<EscalationEntry>(`/api/escalations/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["escalations"] }),
    });
};

export const useDeleteEscalation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/escalations/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["escalations"] }),
    });
};

// ─── PM CHECKLISTS ────────────────────────────────────────────────────────────
export const usePMChecklist = () =>
    useQuery({ queryKey: ["pm_checklist"], queryFn: () => apiFetch<ChecklistTask[]>("/api/pm-checklists"), staleTime: 1000 * 60 * 15 });

export const useCreatePMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<ChecklistTask>) => apiPost<ChecklistTask>("/api/pm-checklists", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["pm_checklist"] }),
    });
};

export const useUpdatePMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ChecklistTask> }) =>
            apiPut<ChecklistTask>(`/api/pm-checklists/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["pm_checklist"] }),
    });
};

export const useDeletePMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/pm-checklists/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["pm_checklist"] }),
    });
};

// ─── REVISION SUMMARIES ───────────────────────────────────────────────────────
export const useRevisionSummary = () =>
    useQuery({ queryKey: ["revision_summary"], queryFn: () => apiFetch<RevisionSummary[]>("/api/revision-summaries"), staleTime: 1000 * 60 * 15 });

export const useCreateRevisionSummary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<RevisionSummary>) => apiPost<RevisionSummary>("/api/revision-summaries", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["revision_summary"] }),
    });
};

export const useUpdateRevisionSummary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<RevisionSummary> }) =>
            apiPut<RevisionSummary>(`/api/revision-summaries/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["revision_summary"] }),
    });
};

export const useDeleteRevisionSummary = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/revision-summaries/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["revision_summary"] }),
    });
};

// ─── FUELING CHECKLISTS ───────────────────────────────────────────────────────
export const useFuelingChecklist = () =>
    useQuery({ queryKey: ["fueling_checklist"], queryFn: () => apiFetch<FuelingChecklistTask[]>("/api/fueling-checklists"), staleTime: 1000 * 60 * 15 });

export const useCreateFuelingChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<FuelingChecklistTask>) => apiPost<FuelingChecklistTask>("/api/fueling-checklists", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["fueling_checklist"] }),
    });
};

export const useUpdateFuelingChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FuelingChecklistTask> }) =>
            apiPut<FuelingChecklistTask>(`/api/fueling-checklists/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["fueling_checklist"] }),
    });
};

export const useDeleteFuelingChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/fueling-checklists/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["fueling_checklist"] }),
    });
};

// ─── CM CHECKLISTS ────────────────────────────────────────────────────────────
export const useCMChecklist = () =>
    useQuery({ queryKey: ["cm_checklist"], queryFn: () => apiFetch<CMChecklistTask[]>("/api/cm-checklists"), staleTime: 1000 * 60 * 15 });

export const useCreateCMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CMChecklistTask>) => apiPost<CMChecklistTask>("/api/cm-checklists", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cm_checklist"] }),
    });
};

export const useUpdateCMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CMChecklistTask> }) =>
            apiPut<CMChecklistTask>(`/api/cm-checklists/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cm_checklist"] }),
    });
};

export const useDeleteCMChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/cm-checklists/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cm_checklist"] }),
    });
};

// ─── WORK ORDER CHECKLISTS ────────────────────────────────────────────────────
export const useWorkOrderChecklist = () =>
    useQuery({ queryKey: ["wo_checklist"], queryFn: () => apiFetch<WorkOrderChecklistTask[]>("/api/work-order-checklists"), staleTime: 1000 * 60 * 15 });

export const useCreateWorkOrderChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<WorkOrderChecklistTask>) => apiPost<WorkOrderChecklistTask>("/api/work-order-checklists", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["wo_checklist"] }),
    });
};

export const useUpdateWorkOrderChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrderChecklistTask> }) =>
            apiPut<WorkOrderChecklistTask>(`/api/work-order-checklists/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["wo_checklist"] }),
    });
};

export const useDeleteWorkOrderChecklist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete(`/api/work-order-checklists/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["wo_checklist"] }),
    });
};
