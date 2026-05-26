import { useQuery } from "@tanstack/react-query";
import { getSites, getUsers, getEscalations, getPMChecklist, getRevisionSummary } from "@/lib/googleSheets";

export const useSites = () => {
    return useQuery({
        queryKey: ["sites"],
        queryFn: getSites,
        staleTime: 1000 * 60 * 5,
    });
};

export const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        staleTime: 1000 * 60 * 10,
    });
};

export const useEscalations = () => {
    return useQuery({
        queryKey: ["escalations"],
        queryFn: getEscalations,
        staleTime: 1000 * 60 * 5,
    });
};

export const usePMChecklist = () => {
    return useQuery({
        queryKey: ["pm_checklist"],
        queryFn: getPMChecklist,
        staleTime: 1000 * 60 * 15,
    });
};

export const useRevisionSummary = () => {
    return useQuery({
        queryKey: ["revision_summary"],
        queryFn: getRevisionSummary,
        staleTime: 1000 * 60 * 15,
    });
};
