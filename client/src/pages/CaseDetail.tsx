import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { casesApi, type Case } from "../api";
import {
  AlertTriangle,
  User,
  Calendar,
  Shield,
  FileText,
  Clock,
  Network,
  BarChart2,
  Upload,
  MessageSquare,
  Link,
} from "lucide-react";

type Tab = "overview" | "timeline" | "evidence" | "entities" | "report";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "evidence", label: "Evidence" },
  { id: "entities", label: "Entities" },
  { id: "report", label: "Report" },
];

// ── Style helpers ─────────────────────────────────────────────────────────────

const statusLabels: Record<Case["status"], string> = {
  open: "Open",
  in_review: "In Review",
  closed: "Closed",
};

const statusStyles: Record<Case["status"], string> = {
  open: "bg-emerald-500/15 text-emerald-400",
  in_review: "bg-violet-500/15 text-violet-400",
  closed: "bg-gray-700 text-gray-500",
};

const priorityStyles: Record<Case["priority"], string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-gray-700 text-gray-400",
};


// ── Sub-views ─────────────────────────────────────────────────────────────────

function Overview({ c }: { c: Case }) {
  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span className="text-gray-500">Priority</span>
            <span className={`ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded capitalize ${priorityStyles[c.priority]}`}>
              {c.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Shield size={13} className="text-emerald-400 shrink-0" />
            <span className="text-gray-500">Status</span>
            <span className={`ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded ${statusStyles[c.status]}`}>
              {statusLabels[c.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={13} className="shrink-0" />
            <span className="text-gray-500">Opened</span>
            <span className="ml-auto text-gray-300">{fmt(c.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={13} className="shrink-0" />
            <span className="text-gray-500">Last updated</span>
            <span className="ml-auto text-gray-300">{fmt(c.updated_at)}</span>
          </div>
        </div>

        {c.description && (
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-500 text-xs mb-1.5">Description</p>
            <p className="text-gray-300 text-sm leading-relaxed">{c.description}</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: FileText, label: "Evidence Items", value: "—" },
          { icon: Network, label: "Linked Entities", value: "—" },
          { icon: User, label: "Timeline Events", value: "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3">
            <Icon size={16} className="text-gray-500" />
            <div>
              <div className="text-white font-semibold">{value}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center space-y-2">
      <Clock size={28} className="text-gray-700 mx-auto" />
      <p className="text-gray-400 font-medium text-sm">No timeline events yet</p>
      <p className="text-gray-600 text-xs max-w-xs mx-auto">
        Timeline events will appear here in Phase 5 when notes and investigation workspace are added.
      </p>
    </div>
  );
}

function Evidence() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Evidence Items</span>
        <button className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
          <Upload size={12} />
          Upload
        </button>
      </div>
      <div className="p-8 text-center space-y-2">
        <FileText size={28} className="text-gray-700 mx-auto" />
        <p className="text-gray-400 font-medium text-sm">No evidence uploaded</p>
        <p className="text-gray-600 text-xs max-w-xs mx-auto">
          Evidence upload with SHA-256 hashing and chain of custody is coming in Phase 3.
        </p>
      </div>
    </div>
  );
}

function Entities() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Linked Entities</span>
        <button className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">
          <Link size={12} />
          Link entity
        </button>
      </div>
      <div className="p-8 text-center space-y-2">
        <Network size={28} className="text-gray-700 mx-auto" />
        <p className="text-gray-400 font-medium text-sm">No entities linked</p>
        <p className="text-gray-600 text-xs max-w-xs mx-auto">
          Entity extraction (IPs, hashes, domains) will be available in Phase 3.
        </p>
      </div>
    </div>
  );
}

function Report() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center space-y-3">
      <BarChart2 size={32} className="text-gray-600 mx-auto" />
      <p className="text-gray-300 font-medium text-sm">Report generation</p>
      <p className="text-gray-500 text-xs max-w-xs mx-auto">
        Generate a structured incident report from timeline events, evidence, and linked entities.
      </p>
      <div className="flex items-center justify-center gap-2 pt-1">
        <button className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors">
          <FileText size={12} />
          Generate report
        </button>
        <button className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded transition-colors">
          <MessageSquare size={12} />
          Add notes
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CaseDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    casesApi.get(Number(id))
      .then(setCaseData)
      .catch(() => setError("Case not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-gray-500 text-sm py-12 text-center">Loading case...</div>;
  }

  if (error || !caseData) {
    return <div className="text-red-400 text-sm py-12 text-center">{error ?? "Case not found."}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">FS-{String(caseData.id).padStart(4, "0")}</p>
          <h1 className="text-xl font-semibold text-white">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium px-2 py-1 rounded capitalize ${priorityStyles[caseData.priority]}`}>
            {caseData.priority}
          </span>
          <span className={`text-[11px] font-medium px-2 py-1 rounded ${statusStyles[caseData.status]}`}>
            {statusLabels[caseData.status]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview"  && <Overview c={caseData} />}
      {activeTab === "timeline"  && <Timeline />}
      {activeTab === "evidence"  && <Evidence />}
      {activeTab === "entities"  && <Entities />}
      {activeTab === "report"    && <Report />}
    </div>
  );
}
