import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, RefreshCw, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { casesApi, type Case } from "../api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function caseRef(id: number) {
  return `FS-${String(id).padStart(4, "0")}`;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const priorityStyles: Record<Case["priority"], string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-gray-700 text-gray-400",
};

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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.list()
      .then(setCases)
      .finally(() => setLoading(false));
  }, []);

  // Derived stats
  const openCount   = cases.filter((c) => c.status === "open").length;
  const reviewCount = cases.filter((c) => c.status === "in_review").length;
  const highCount   = cases.filter((c) => c.priority === "high").length;
  const closedCount = cases.filter((c) => c.status === "closed").length;
  const todayCount  = cases.filter((c) => isToday(c.updated_at)).length;

  const stats = [
    {
      label: "Open Cases",
      value: openCount,
      icon: FolderOpen,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      delta: reviewCount > 0 ? `${reviewCount} in review` : "None in review",
      deltaUp: null,
    },
    {
      label: "Updated Today",
      value: todayCount,
      icon: RefreshCw,
      iconColor: "text-violet-400",
      bgColor: "bg-violet-500/10",
      delta: "across all cases",
      deltaUp: null,
    },
    {
      label: "High Priority",
      value: highCount,
      icon: AlertTriangle,
      iconColor: "text-red-400",
      bgColor: "bg-red-500/10",
      delta: highCount > 0 ? "need attention" : "None flagged",
      deltaUp: highCount > 0 ? false : null,
    },
    {
      label: "Closed Cases",
      value: closedCount,
      icon: CheckCircle,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      delta: `${cases.length} total cases`,
      deltaUp: null,
    },
  ];

  // Recent cases: top 5 by updated_at
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Activity: derive from case creation/update events, sorted by recency
  const activity = [...cases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      caseRef: caseRef(c.id),
      title: c.title,
      action: "Case opened",
      time: timeAgo(c.created_at),
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Investigation overview</p>
        </div>
        <button
          onClick={() => navigate("/cases")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          <Plus size={14} />
          New Case
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconColor, bgColor, delta, deltaUp }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</span>
              <span className={`p-1.5 rounded-md ${bgColor}`}>
                <Icon size={14} className={iconColor} />
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? <span className="text-gray-700">—</span> : value}
            </div>
            <div className="text-xs">
              <span className={
                deltaUp === true  ? "text-emerald-400" :
                deltaUp === false ? "text-red-400" :
                "text-gray-500"
              }>
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Activity feed */}
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Clock size={13} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-300">Recent Activity</span>
          </div>

          {loading && (
            <p className="text-gray-600 text-xs px-4 py-6 text-center">Loading...</p>
          )}

          {!loading && activity.length === 0 && (
            <p className="text-gray-600 text-xs px-4 py-6 text-center">No activity yet.</p>
          )}

          <ul className="divide-y divide-gray-800/60">
            {activity.map((item) => (
              <li
                key={item.id}
                onClick={() => navigate(`/cases/${item.id}`)}
                className="px-4 py-3 space-y-1 hover:bg-gray-800/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-gray-400 leading-snug">{item.action}</span>
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">
                    new
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">{item.title}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                  <span className="font-mono">{item.caseRef}</span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent cases table */}
        <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen size={13} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-300">Recent Cases</span>
            </div>
            <button
              onClick={() => navigate("/cases")}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all
            </button>
          </div>

          {loading && (
            <p className="text-gray-600 text-xs px-4 py-6 text-center">Loading...</p>
          )}

          {!loading && recentCases.length === 0 && (
            <p className="text-gray-600 text-xs px-4 py-6 text-center">No cases yet.</p>
          )}

          {recentCases.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-800/60">
                  <th className="text-left px-4 py-2 font-medium">Case</th>
                  <th className="text-left px-4 py-2 font-medium">Priority</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {recentCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5">
                      <div className="text-white text-xs font-medium leading-snug">{c.title}</div>
                      <div className="text-gray-600 font-mono text-[11px]">{caseRef(c.id)}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded capitalize ${priorityStyles[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusStyles[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{timeAgo(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
