"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

// ─── Shared types ──────────────────────────────────────────────────────────────

type UserRecord = {
  id: number;
  name: string;
  emailAddress: string;
  jobTitle: string;
  isEmployee: boolean;
  employeeId: string;
  countryCode: string;
  lastLoginAt: string;
};

type VendorRecord = {
  id: number;
  companyId: number;
  name: string;
  abbreviatedName: string;
  address: string;
  city: string;
  zip: string;
  countryCode: string;
  businessPhone: string;
  emailAddress: string;
  licenseNumber: string;
  laborUnion: string;
  isActive: boolean;
  isConnected: boolean;
  notes: string;
};

type MemberKind = "user" | "vendor";

type Member =
  | { kind: "user"; data: UserRecord }
  | { kind: "vendor"; data: VendorRecord };

type Message = {
  id: number;
  author: string;
  initials: string;
  text: string;
  timestamp: string;
};

type TaskStatus = "waiting" | "active" | "complete";

type Task = {
  id: number;
  title: string;
  description: string;
  who: string;
  status: TaskStatus;
  dateOpened: string;
  dateStarted: string;
  dateComplete: string;
};

type ProjectLink = { id: number; title: string; url: string; description: string };

// ─── Seed data ─────────────────────────────────────────────────────────────────

const PROJECT_MEMBERS: Member[] = [
  {
    kind: "user",
    data: {
      id: 1,
      name: "Mia Alvarez",
      emailAddress: "mia.alvarez@buildco.com",
      jobTitle: "Project Manager",
      isEmployee: true,
      employeeId: "EMP-1001",
      countryCode: "GB",
      lastLoginAt: "2026-05-08T14:22:00Z",
    },
  },
  {
    kind: "user",
    data: {
      id: 2,
      name: "Noah Bennett",
      emailAddress: "noah.bennett@buildco.com",
      jobTitle: "Estimator",
      isEmployee: true,
      employeeId: "EMP-1002",
      countryCode: "GB",
      lastLoginAt: "2026-05-09T07:50:00Z",
    },
  },
  {
    kind: "user",
    data: {
      id: 3,
      name: "Ava Patel",
      emailAddress: "ava.patel@northfieldgc.com",
      jobTitle: "Superintendent",
      isEmployee: true,
      employeeId: "EMP-3311",
      countryCode: "GB",
      lastLoginAt: "2026-05-09T11:32:00Z",
    },
  },
  {
    kind: "vendor",
    data: {
      id: 1,
      companyId: 200,
      name: "Summit Electrical Supply",
      abbreviatedName: "Summit Elec",
      address: "14 Whitfield Street",
      city: "London",
      zip: "W1T 2RH",
      countryCode: "GB",
      businessPhone: "+44 20 7946 0132",
      emailAddress: "orders@summitelectrical.com",
      licenseNumber: "LIC-40192",
      laborUnion: "IBEW",
      isActive: true,
      isConnected: true,
      notes: "Preferred vendor for panel boards and switchgear.",
    },
  },
  {
    kind: "vendor",
    data: {
      id: 3,
      companyId: 310,
      name: "Harbor HVAC Solutions",
      abbreviatedName: "Harbor HVAC",
      address: "8 Maritime Quarter",
      city: "Swansea",
      zip: "SA1 1RR",
      countryCode: "GB",
      businessPhone: "+44 1792 555 0148",
      emailAddress: "service@harborhvac.com",
      licenseNumber: "LIC-77811",
      laborUnion: "UA",
      isActive: true,
      isConnected: true,
      notes: "Supports tenant improvement work.",
    },
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: 1,
    author: "Mia Alvarez",
    initials: "MA",
    text: "Just confirmed the structural drawings are approved. We can proceed with the foundation pour next week.",
    timestamp: "2026-05-06T09:14:00Z",
  },
  {
    id: 2,
    author: "Noah Bennett",
    initials: "NB",
    text: "Thanks Mia. I've updated the estimate to reflect the revised material costs from Summit Electrical. Budget impact is minimal.",
    timestamp: "2026-05-06T10:02:00Z",
  },
  {
    id: 3,
    author: "Ava Patel",
    initials: "AP",
    text: "Site access will be restricted Thursday morning for a utility survey. Please ensure subcontractors are notified.",
    timestamp: "2026-05-07T08:45:00Z",
  },
  {
    id: 4,
    author: "Mia Alvarez",
    initials: "MA",
    text: "Noted Ava – I've sent notification to all subs. Harbor HVAC have confirmed they'll work around the restriction.",
    timestamp: "2026-05-07T09:30:00Z",
  },
  {
    id: 5,
    author: "Noah Bennett",
    initials: "NB",
    text: "Can someone confirm the ceiling height spec on Level 2? The drawings show 3.2m but the brief says 3.0m.",
    timestamp: "2026-05-08T14:15:00Z",
  },
  {
    id: 6,
    author: "Ava Patel",
    initials: "AP",
    text: "Checked with the architect – it's 3.2m. The brief is outdated. RFI response attached to the drawing set.",
    timestamp: "2026-05-08T16:42:00Z",
  },
];

const SEED_TASKS: Task[] = [
  {
    id: 1,
    title: "Confirm structural drawings",
    description: "Sign off revised structural drawings with project engineer before mobilisation.",
    who: "Mia Alvarez",
    status: "complete",
    dateOpened: "2026-04-20",
    dateStarted: "2026-04-22",
    dateComplete: "2026-05-06",
  },
  {
    id: 2,
    title: "Electrical materials procurement",
    description: "Place order with Summit Electrical for panel boards and switchgear.",
    who: "Summit Electrical Supply",
    status: "active",
    dateOpened: "2026-04-28",
    dateStarted: "2026-05-02",
    dateComplete: "",
  },
  {
    id: 3,
    title: "Utility survey coordination",
    description: "Schedule and notify all subs of Thursday utility survey access restriction.",
    who: "Ava Patel",
    status: "complete",
    dateOpened: "2026-05-01",
    dateStarted: "2026-05-06",
    dateComplete: "2026-05-07",
  },
  {
    id: 4,
    title: "Level 2 ceiling spec RFI",
    description: "Raise RFI to clarify Level 2 ceiling height discrepancy between brief and drawings.",
    who: "Noah Bennett",
    status: "complete",
    dateOpened: "2026-05-08",
    dateStarted: "2026-05-08",
    dateComplete: "2026-05-08",
  },
  {
    id: 5,
    title: "HVAC ductwork installation review",
    description: "Review Harbor HVAC proposed duct routing on Level 1 before works commence.",
    who: "Harbor HVAC Solutions",
    status: "waiting",
    dateOpened: "2026-05-09",
    dateStarted: "",
    dateComplete: "",
  },
];

const SEED_LINKS: ProjectLink[] = [
  {
    id: 1,
    title: "HSE Risk Assessment Guide",
    url: "https://www.hse.gov.uk/simple-health-safety/risk/index.htm?utm_source=hse.gov.uk&utm_medium=referral&utm_campaign=hse-guidance&utm_term=risk&utm_content=home-page-popular",
    description: "Step-by-step guide to conducting risk assessments on construction sites.",
  },
  {
    id: 2,
    title: "HSE Work Equipment & Machinery",
    url: "https://www.hse.gov.uk/work-equipment-machinery/?utm_source=hse.gov.uk&utm_medium=referral&utm_campaign=hse-guidance&utm_term=equipment&utm_content=home-page-popular",
    description: "Guidance on safe use and maintenance of work equipment and machinery.",
  },
  {
    id: 3,
    title: "HSE Manual Handling",
    url: "https://www.hse.gov.uk/msd/manual-handling/index.htm?utm_source=hse.gov.uk&utm_medium=referral&utm_campaign=hse-guidance&utm_term=man-han&utm_content=home-page-popular",
    description: "Best practice for manual handling to reduce musculoskeletal injury risk.",
  },
];

const MEMBER_NAMES = PROJECT_MEMBERS.map((m) => m.data.name);

const emptyTask = (): Omit<Task, "id"> => ({
  title: "",
  description: "",
  who: MEMBER_NAMES[0] ?? "",
  status: "waiting",
  dateOpened: new Date().toISOString().slice(0, 10),
  dateStarted: "",
  dateComplete: "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function fmt(iso: string | undefined | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  waiting: "bg-slate-600 text-slate-200",
  active: "bg-teal-600 text-white",
  complete: "bg-emerald-700 text-white",
};

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-800/70 p-5 ${className}`}>
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-100">{value ?? "-"}</dd>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-orange-500">
      {toInitials(name)}
    </div>
  );
}

// ─── Detail modals (read-only) ─────────────────────────────────────────────────

function UserDetailModal({
  user,
  onClose,
}: {
  user: UserRecord;
  onClose: () => void;
}) {
  return (
    <ModalShell title="User Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoRow label="Name" value={user.name} />
        <InfoRow label="Email" value={user.emailAddress} />
        <InfoRow label="Job Title" value={user.jobTitle} />
        <InfoRow label="Employee" value={user.isEmployee ? "Yes" : "No"} />
        <InfoRow label="Employee ID" value={user.employeeId || "-"} />
        <InfoRow label="Country Code" value={user.countryCode} />
        <InfoRow label="Last Login" value={fmt(user.lastLoginAt)} />
      </div>
    </ModalShell>
  );
}

function VendorDetailModal({
  vendor,
  onClose,
}: {
  vendor: VendorRecord;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Vendor Details" onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoRow label="Name" value={vendor.name} />
        <InfoRow label="Abbreviated Name" value={vendor.abbreviatedName} />
        <InfoRow label="Email" value={vendor.emailAddress} />
        <InfoRow label="Phone" value={vendor.businessPhone} />
        <InfoRow label="Address" value={vendor.address} />
        <InfoRow label="City" value={vendor.city} />
        <InfoRow label="Post Code" value={vendor.zip} />
        <InfoRow label="Country Code" value={vendor.countryCode} />
        <InfoRow label="License Number" value={vendor.licenseNumber} />
        <InfoRow label="Labor Union" value={vendor.laborUnion} />
        <InfoRow label="Active" value={vendor.isActive ? "Yes" : "No"} />
        <InfoRow label="Connected" value={vendor.isConnected ? "Yes" : "No"} />
        {vendor.notes && (
          <div className="sm:col-span-2">
            <InfoRow label="Notes" value={vendor.notes} />
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function ProjectInfoSection() {
  return (
    <Card title="Project Information">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
          <Image
            src="/grill_burger_logo.png"
            alt="Company logo"
            fill
            className="object-cover"
          />
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <InfoRow label="Project Title" value="Grill & Burger Fitout" />
          <InfoRow label="Location" value="6309 Carpinteria Avenue, Carpinteria, CA, 93013" />
          <InfoRow label="Stage" value="Construction" />
          <InfoRow label="Type" value="Commercial Fitout" />
          <InfoRow label="Square Metres" value="420 m²" />
        </dl>
      </div>
    </Card>
  );
}

function ProjectDatesSection() {
  return (
    <Card title="Project Dates">
      <dl className="grid grid-cols-2 gap-6">
        <InfoRow label="Start Date" value="14 Jan 2026" />
        <InfoRow label="End Date" value="30 Aug 2026" />
      </dl>
    </Card>
  );
}

function ProjectMembersSection() {
  const [activeModal, setActiveModal] = useState<
    | { kind: "user"; data: UserRecord }
    | { kind: "vendor"; data: VendorRecord }
    | null
  >(null);

  return (
    <Card title="Project Members">
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Role / Type</th>
              <th className="px-3 py-2 font-semibold">Kind</th>
            </tr>
          </thead>
          <tbody>
            {PROJECT_MEMBERS.map((member) => {
              const name = member.data.name;
              const email = member.kind === "user" ? member.data.emailAddress : member.data.emailAddress;
              const role = member.kind === "user" ? member.data.jobTitle : member.data.abbreviatedName;
              return (
                <tr key={`${member.kind}-${member.data.id}`} className="border-t border-slate-700 text-slate-100">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModal({ kind: member.kind, data: member.data as never })
                      }
                      className="font-semibold text-teal-300 underline-offset-4 hover:underline"
                    >
                      {name}
                    </button>
                  </td>
                  <td className="px-3 py-2">{email}</td>
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        member.kind === "user"
                          ? "bg-teal-900 text-teal-200"
                          : "bg-slate-600 text-slate-200"
                      }`}
                    >
                      {member.kind === "user" ? "User" : "Vendor"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeModal?.kind === "user" && (
        <UserDetailModal user={activeModal.data} onClose={() => setActiveModal(null)} />
      )}
      {activeModal?.kind === "vendor" && (
        <VendorDetailModal vendor={activeModal.data} onClose={() => setActiveModal(null)} />
      )}
    </Card>
  );
}

function ProjectMessagesSection() {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next: Message = {
      id: messages.length + 1,
      author: "Mia Alvarez",
      initials: "MA",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, next]);
    setText("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <Card title="Project Messages">
      <div className="flex h-80 flex-col overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-3">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4 flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-orange-500">
              {msg.initials}
            </div>
            <div className="flex-1 rounded-lg bg-slate-800 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-teal-300">{msg.author}</span>
                <span className="text-xs text-slate-500">{fmt(msg.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-200">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message and press Enter…"
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
        >
          Send
        </button>
      </div>
    </Card>
  );
}

function ProjectFilesSection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <Card title="Project Files">
      <div className="flex flex-wrap gap-4">
        {/* Photo */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900 transition-colors hover:border-teal-400"
        >
          <Image
            src="/grill_interior.png"
            alt="Grill interior photo"
            width={200}
            height={140}
            className="h-36 w-48 object-cover"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent px-3 pb-2">
            <span className="text-xs font-semibold text-white">grill_interior.png</span>
          </div>
        </button>

        {/* Floorplan */}
        <Link
          href="/project"
          className="group relative flex h-36 w-48 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 transition-colors hover:border-teal-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7.5L7.5 3h9L21 7.5v9L16.5 21h-9L3 16.5v-9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M10 3v18" />
          </svg>
          <span className="text-sm font-semibold text-slate-200 group-hover:text-teal-300">
            Drawing1 – Floor Plan
          </span>
          <span className="text-xs text-slate-500">Click to open in Drawing tool</span>
        </Link>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src="/grill_interior.png"
              alt="Grill interior photo"
              width={1200}
              height={800}
              className="max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function OpenItemsSection() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Task, "id">>(emptyTask());

  function openAddModal() {
    setDraft(emptyTask());
    setIsAddOpen(true);
  }

  function saveTask() {
    const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    setTasks((prev) => [...prev, { id: nextId, ...draft }]);
    setIsAddOpen(false);
  }

  function updateStatus(taskId: number, status: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const dateComplete =
          status === "complete" && !t.dateComplete
            ? new Date().toISOString().slice(0, 10)
            : t.dateComplete;
        const dateStarted =
          status === "active" && !t.dateStarted
            ? new Date().toISOString().slice(0, 10)
            : t.dateStarted;
        return { ...t, status, dateComplete, dateStarted };
      })
    );
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none placeholder:text-slate-500";

  return (
    <Card title="Open Items">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
        >
          Add Task
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Who</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Date Opened</th>
              <th className="px-3 py-2 font-semibold">Date Started</th>
              <th className="px-3 py-2 font-semibold">Date Complete</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-slate-700 text-slate-100">
                <td className="px-3 py-2 font-medium">{task.title}</td>
                <td className="max-w-xs truncate px-3 py-2 text-slate-300">{task.description}</td>
                <td className="px-3 py-2">{task.who}</td>
                <td className="px-3 py-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer border-0 outline-none appearance-none ${STATUS_STYLES[task.status]}`}
                  >
                    <option value="waiting">Waiting</option>
                    <option value="active">Active</option>
                    <option value="complete">Complete</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-slate-300">{fmt(task.dateOpened)}</td>
                <td className="px-3 py-2 text-slate-300">{fmt(task.dateStarted)}</td>
                <td className="px-3 py-2 text-slate-300">{fmt(task.dateComplete)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tasks.length && (
          <div className="p-6 text-center text-sm text-slate-400">No tasks yet.</div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add Task</h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-300 md:col-span-2">
                Title
                <input
                  required
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className={inputCls}
                />
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">
                Description
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className={inputCls}
                />
              </label>

              <label className="text-sm text-slate-300">
                Assigned To
                <select
                  value={draft.who}
                  onChange={(e) => setDraft((d) => ({ ...d, who: e.target.value }))}
                  className={inputCls}
                >
                  {MEMBER_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Status
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))}
                  className={inputCls}
                >
                  <option value="waiting">Waiting</option>
                  <option value="active">Active</option>
                  <option value="complete">Complete</option>
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Date Opened
                <input
                  type="date"
                  value={draft.dateOpened}
                  onChange={(e) => setDraft((d) => ({ ...d, dateOpened: e.target.value }))}
                  className={inputCls}
                />
              </label>

              <label className="text-sm text-slate-300">
                Date Started
                <input
                  type="date"
                  value={draft.dateStarted}
                  onChange={(e) => setDraft((d) => ({ ...d, dateStarted: e.target.value }))}
                  className={inputCls}
                />
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">
                Date Complete
                <input
                  type="date"
                  value={draft.dateComplete}
                  onChange={(e) => setDraft((d) => ({ ...d, dateComplete: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTask}
                className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white hover:bg-teal-400"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ProjectLinksSection() {
  return (
    <Card title="Project Links">
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">URL</th>
            </tr>
          </thead>
          <tbody>
            {SEED_LINKS.map((link) => (
              <tr key={link.id} className="border-t border-slate-700 text-slate-100">
                <td className="px-3 py-2 font-medium">{link.title}</td>
                <td className="px-3 py-2 text-slate-300">{link.description}</td>
                <td className="px-3 py-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-300 underline-offset-4 hover:underline"
                  >
                    Open link ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectOverviewPage() {
  return (
    <main className="min-h-screen bg-slate-900 px-6 py-8 text-white md:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
            <p className="mt-1 text-slate-400">Grill &amp; Burger Fitout — Demo project</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <Link
              href="/"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              ← Home
            </Link>
            <Link
              href="/directory"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Directory
            </Link>
            <Link
              href="/project"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Drawing
            </Link>
            <Link
              href="/budget"
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
            >
              Budget ↗
            </Link>
          </div>
        </div>

        {/* Top row: info + dates side by side */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ProjectInfoSection />
          </div>
          <ProjectDatesSection />
        </div>

        {/* Members + Messages */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProjectMembersSection />
          <ProjectMessagesSection />
        </div>

        {/* Files full-width */}
        <ProjectFilesSection />

        {/* Open Items full-width */}
        <OpenItemsSection />

        {/* Links full-width */}
        <ProjectLinksSection />
      </div>
    </main>
  );
}
