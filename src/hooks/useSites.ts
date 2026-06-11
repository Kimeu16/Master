import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSites = () => {
    return useQuery({
        queryKey: ["sites"],
        queryFn: () => api.get("/sites"),
        staleTime: 1000 * 60 * 5,
    });
};

export const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => api.get("/users"),
        staleTime: 1000 * 60 * 10,
    });
};

export const useEscalations = () => {
    return useQuery({
        queryKey: ["escalations"],
        queryFn: () => api.get("/escalations"),
        staleTime: 1000 * 60 * 5,
    });
};

export const usePMChecklist = () => {
    return useQuery({
        queryKey: ["pm_checklist"],
        queryFn: () => api.get("/pm-checklists"),
        staleTime: 1000 * 60 * 15,
    });
};

export const useRevisionSummary = () => {
    return useQuery({
        queryKey: ["revision_summary"],
        queryFn: () => api.get("/revision-summaries"),
        staleTime: 1000 * 60 * 15,
    });
};
