import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export interface Case {
  id: number;
  title: string;
  description: string | null;
  status: "open" | "in_review" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface CaseCreate {
  title: string;
  description?: string;
  status?: Case["status"];
  priority?: Case["priority"];
}

export const casesApi = {
  list: () => api.get<Case[]>("/cases/").then((r) => r.data),
  get: (id: number) => api.get<Case>(`/cases/${id}`).then((r) => r.data),
  create: (payload: CaseCreate) => api.post<Case>("/cases/", payload).then((r) => r.data),
  update: (id: number, payload: Partial<CaseCreate>) =>
    api.patch<Case>(`/cases/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/cases/${id}`),
};
