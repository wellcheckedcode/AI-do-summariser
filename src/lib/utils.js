import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Simple in-memory example data. Replace with Supabase queries later.
export const departmentDocuments = {
  HR: [
    {
      id: "hr-1",
      title: "Hiring Policy Overview",
      summary: "Key steps in recruitment, interview guidelines, and onboarding checklist.",
      updatedAt: "2025-08-20",
    },
    {
      id: "hr-2",
      title: "Leave and Benefits Summary",
      summary: "Annual leave, sick leave, parental benefits, and approval workflows.",
      updatedAt: "2025-07-15",
    },
  ],
  IT: [
    {
      id: "it-1",
      title: "Security Playbook",
      summary: "Password policy, MFA rollout, incident response tiers, and SLAs.",
      updatedAt: "2025-08-10",
    },
    {
      id: "it-2",
      title: "Asset Management Guide",
      summary: "Procurement flow, device lifecycle, and deprovisioning checklist.",
      updatedAt: "2025-06-02",
    },
  ],
  Finance: [
    {
      id: "fin-1",
      title: "Quarterly Budget Summary",
      summary: "Spend vs plan, variance drivers, and next-quarter allocations.",
      updatedAt: "2025-09-01",
    },
  ],
  Operations: [
    {
      id: "ops-1",
      title: "SOP Highlights",
      summary: "Daily runbook, escalation matrix, and maintenance windows.",
      updatedAt: "2025-08-05",
    },
  ],
  Legal: [
    {
      id: "leg-1",
      title: "Contracting Guidelines",
      summary: "NDA templates, review checklist, and approval thresholds.",
      updatedAt: "2025-07-28",
    },
  ],
};