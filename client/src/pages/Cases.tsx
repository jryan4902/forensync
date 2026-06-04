import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, X, AlertCircle } from "lucide-react";
import { casesApi, type Case, type CaseCreate } from "../api";

const statusStyles: Record<Case["status"], string> = {
  open: "bg-emerald-500/15 text-emerald-400",
  in_review: "bg-violet-500/15 text-violet-400",
  closed: "bg-gray-700 text-gray-500",
};

const statusLabels: Record<Case["status"], string> = {
  open: "Open",
  in_review: "In Review",
  closed: "Closed",
};

const priorityStyles: Record<Case["priority"], string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-gray-700 text-gray-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── New Case Modal ────────────────────────────────────────────────────────────

interface NewCaseModalProps {
  onClose: () => void;
  onCreated: (c: Case) => void;
}

function NewCaseModal({ onClose, onCreated }: NewCaseModalProps) {
  const [form, setForm] = useState<CaseCreate>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await casesApi.create({
        ...form,
        description: form.description || undefined,
      });
      onCreated(created);
    } catch {
      setError("Failed to create case. Check the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-medium text-sm">New Case</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Ransomware — Apex Financial"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of the investigation..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Case["priority"] })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Case["status"] })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-200 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
            >
              {loading ? "Creating..." : "Create case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    casesApi.list()
      .then(setCases)
      .catch(() => setError("Could not load cases. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(newCase: Case) {
    setCases((prev) => [newCase, ...prev]);
    setShowModal(false);
  }

  return (
    <>
      {showModal && <NewCaseModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Cases</h1>
            <p className="text-gray-500 text-sm mt-0.5">All investigation cases</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <Plus size={14} />
            New Case
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-gray-500 text-sm py-12 text-center">Loading cases...</div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg py-16 text-center space-y-3">
            <FolderOpen size={32} className="text-gray-700 mx-auto" />
            <p className="text-gray-400 font-medium text-sm">No cases yet</p>
            <p className="text-gray-600 text-xs">Create your first investigation case to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded transition-colors"
            >
              <Plus size={13} />
              New Case
            </button>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left px-5 py-3 font-medium">Case</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3">
                      <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </div>
                      {c.description && (
                        <div className="text-gray-600 text-xs mt-0.5 truncate max-w-xs">
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded capitalize ${priorityStyles[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusStyles[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
