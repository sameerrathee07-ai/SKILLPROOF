"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  ArrowLeft, 
  PlusCircle, 
  CheckCircle2 
} from "lucide-react";
import { SlideButton } from "@/components/SlideButton";


export default function NewProblemPage() {
  const router = useRouter();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState("COACHING_CENTER");
  const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(false);

  const [title, setTitle] = useState("");
  const [frictionCategory, setFrictionCategory] = useState("STUDENT_RETENTION");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch("/api/organizations?mine=1");
        if (res.ok) {
          const data = await res.json();
          setOrganizations(data);
          if (data.length > 0) {
            setSelectedOrgId(data[0].id);
          } else {
            setIsCreatingNewOrg(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!title || !description) {
      alert("Please provide problem title and description");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const payload: any = {
        title,
        description,
        frictionCategory,
      };

      if (isCreatingNewOrg) {
        payload.orgName = newOrgName || "New Education Center";
        payload.orgType = newOrgType;
      } else {
        payload.organizationId = selectedOrgId;
      }

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to post challenge");
        return;
      }

      router.push(`/org/problems/${data.id}/proposals`);
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException && e.name === "AbortError") {
        alert("The request timed out. Check your connection and try again.");
      } else {
        alert("Submission error");
      }
    } finally {
      clearTimeout(timeoutId);
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2">
        <Link
          href="/problems"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to all challenges
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Post an Education Challenge
        </h1>
        <p className="text-sm text-slate-400">
          Describe your operational friction. All student proposals must pass the deterministic 6.0 quality gate before arriving in your vetted inbox.
        </p>
      </div>

      {/* Posting Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Multi-Tenant Organization Scope */}
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Posting Organization (Multi-Tenant Scope) <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsCreatingNewOrg(false)}
              className={`font-semibold pb-1 border-b-2 transition-colors ${
                !isCreatingNewOrg
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Select Existing Partner
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNewOrg(true)}
              className={`font-semibold pb-1 border-b-2 transition-colors ${
                isCreatingNewOrg
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              + Add New Education Org
            </button>
          </div>

          {!isCreatingNewOrg ? (
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.type.replace("_", " ")})
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Cambridge Tutorials or Zenith College"
                className="w-full p-2.5 text-sm rounded-lg border border-slate-300"
              />
              <select
                value={newOrgType}
                onChange={(e) => setNewOrgType(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="COACHING_CENTER">Coaching Center</option>
                <option value="TUITION_ACADEMY">Tuition Academy</option>
                <option value="COLLEGE_DEPT">College Department</option>
              </select>
            </div>
          )}
        </div>

        {/* Friction Category */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Operational Friction Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: "STUDENT_RETENTION", label: "Student Retention & Absences" },
              { id: "SCHEDULING", label: "Scheduling & Tutors" },
              { id: "ADMIN_WORKFLOW", label: "Admin Workflow & Quotas" },
            ].map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setFrictionCategory(cat.id)}
                className={`p-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                  frictionCategory === cat.id
                    ? "bg-brand-50 border-brand-500 text-brand-800 ring-1 ring-brand-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Challenge Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Automated batch attendance & drop-out early warning trigger"
            className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* Challenge Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Detailed Friction & Operational Context <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe the current workflow, why it is breaking, how many students or faculty are affected, and what an ideal lightweight solution looks like."
            className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <SlideButton
            type="submit"
            disabled={submitting}
            variant="primary"
            icon={<PlusCircle className="w-4 h-4 text-slate-400" />}
            className="px-6 py-3 text-xs font-bold"
          >
            <span>{submitting ? "Publishing Challenge..." : "Publish Challenge & Open Vetted Inbox"}</span>
          </SlideButton>
        </div>
      </form>
    </div>
  );
}
