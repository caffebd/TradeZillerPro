"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

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

type UserForm = {
  name: string;
  emailAddress: string;
  jobTitle: string;
  isEmployee: string;
  employeeId: string;
  countryCode: string;
};

type VendorForm = {
  companyId: string;
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
  isActive: string;
  isConnected: string;
  notes: string;
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
  originCode: string;
  createdAt: string;
};

type ModalState =
  | {
      kind: "create-user";
      mode: "create";
      draft: UserForm;
    }
  | {
      kind: "create-vendor";
      mode: "create";
      draft: VendorForm;
    }
  | {
      kind: "user";
      mode: "view" | "edit";
      draft: UserRecord;
    }
  | {
      kind: "vendor";
      mode: "view" | "edit";
      draft: VendorRecord;
    };

type TabKey = "all" | "users" | "vendors";

const seedUsers: UserRecord[] = [
  {
    id: 1,
    name: "Mia Alvarez",
    emailAddress: "mia.alvarez@buildco.com",
    jobTitle: "Project Manager",
    isEmployee: true,
    employeeId: "EMP-1001",
    countryCode: "US",
    lastLoginAt: "2026-05-08T14:22:00Z",
  },
  {
    id: 2,
    name: "Noah Bennett",
    emailAddress: "noah.bennett@buildco.com",
    jobTitle: "Estimator",
    isEmployee: true,
    employeeId: "EMP-1002",
    countryCode: "US",
    lastLoginAt: "2026-05-09T07:50:00Z",
  },
  {
    id: 3,
    name: "Ava Patel",
    emailAddress: "ava.patel@northfieldgc.com",
    jobTitle: "Superintendent",
    isEmployee: true,
    employeeId: "EMP-3311",
    countryCode: "CA",
    lastLoginAt: "2026-05-09T11:32:00Z",
  },
  {
    id: 4,
    name: "Liam Turner",
    emailAddress: "liam.turner@northfieldgc.com",
    jobTitle: "Project Engineer",
    isEmployee: true,
    employeeId: "EMP-3312",
    countryCode: "GB",
    lastLoginAt: "2026-05-07T17:04:00Z",
  },
  {
    id: 5,
    name: "Sophia Kim",
    emailAddress: "sophia.kim@summitpartners.io",
    jobTitle: "Client Representative",
    isEmployee: false,
    employeeId: "",
    countryCode: "US",
    lastLoginAt: "2026-05-06T20:14:00Z",
  },
  {
    id: 6,
    name: "Ethan Rivera",
    emailAddress: "ethan.rivera@summitpartners.io",
    jobTitle: "Cost Consultant",
    isEmployee: false,
    employeeId: "CNT-4420",
    countryCode: "MX",
    lastLoginAt: "2026-05-09T04:41:00Z",
  },
];

const seedVendors: VendorRecord[] = [
  {
    id: 1,
    companyId: 200,
    name: "Summit Electrical Supply",
    abbreviatedName: "Summit Elec",
    address: "1820 Harbor Blvd",
    city: "Long Beach",
    zip: "90802",
    countryCode: "US",
    businessPhone: "+1 (562) 555-0132",
    emailAddress: "orders@summitelectrical.com",
    licenseNumber: "LIC-40192",
    laborUnion: "IBEW",
    isActive: true,
    isConnected: true,
    notes: "Preferred vendor for panel boards and switchgear.",
    originCode: "PROC-1001",
    createdAt: "2025-09-15T12:30:00Z",
  },
  {
    id: 2,
    companyId: 200,
    name: "North River Concrete",
    abbreviatedName: "NR Concrete",
    address: "77 River Street",
    city: "Sacramento",
    zip: "95814",
    countryCode: "US",
    businessPhone: "+1 (916) 555-0191",
    emailAddress: "dispatch@northriverconcrete.com",
    licenseNumber: "LIC-55508",
    laborUnion: "LIUNA",
    isActive: true,
    isConnected: false,
    notes: "Used for slab and foundation pours.",
    originCode: "PROC-1008",
    createdAt: "2025-10-04T08:11:00Z",
  },
  {
    id: 3,
    companyId: 310,
    name: "Harbor HVAC Solutions",
    abbreviatedName: "Harbor HVAC",
    address: "915 Dockside Ave",
    city: "Seattle",
    zip: "98101",
    countryCode: "US",
    businessPhone: "+1 (206) 555-0148",
    emailAddress: "service@harborhvac.com",
    licenseNumber: "LIC-77811",
    laborUnion: "UA",
    isActive: true,
    isConnected: true,
    notes: "Supports tenant improvement work.",
    originCode: "PROC-1130",
    createdAt: "2025-12-19T15:42:00Z",
  },
  {
    id: 4,
    companyId: 310,
    name: "Pinecrest Drywall Group",
    abbreviatedName: "Pinecrest Drywall",
    address: "44 Maple Industrial Park",
    city: "Portland",
    zip: "97205",
    countryCode: "US",
    businessPhone: "+1 (503) 555-0177",
    emailAddress: "bids@pinecrestdrywall.com",
    licenseNumber: "LIC-88302",
    laborUnion: "None",
    isActive: false,
    isConnected: false,
    notes: "Inactive pending insurance update.",
    originCode: "PROC-1188",
    createdAt: "2026-01-12T10:05:00Z",
  },
  {
    id: 5,
    companyId: 412,
    name: "Cobalt Site Services",
    abbreviatedName: "Cobalt Site",
    address: "1280 Commerce Way",
    city: "Austin",
    zip: "78701",
    countryCode: "US",
    businessPhone: "+1 (512) 555-0107",
    emailAddress: "ops@cobaltsite.com",
    licenseNumber: "LIC-29047",
    laborUnion: "Operating Engineers",
    isActive: true,
    isConnected: true,
    notes: "Earthwork and site logistics partner.",
    originCode: "PROC-1203",
    createdAt: "2026-02-08T09:18:00Z",
  },
  {
    id: 6,
    companyId: 412,
    name: "Stonebridge Interiors",
    abbreviatedName: "Stonebridge",
    address: "509 Mason Lane",
    city: "Denver",
    zip: "80202",
    countryCode: "US",
    businessPhone: "+1 (303) 555-0128",
    emailAddress: "estimating@stonebridgeint.com",
    licenseNumber: "LIC-64018",
    laborUnion: "Carpenters",
    isActive: true,
    isConnected: false,
    notes: "High volume finish and millwork packages.",
    originCode: "PROC-1214",
    createdAt: "2026-03-22T16:54:00Z",
  },
];

const emptyUserForm: UserForm = {
  name: "",
  emailAddress: "",
  jobTitle: "",
  isEmployee: "true",
  employeeId: "",
  countryCode: "",
};

const emptyVendorForm: VendorForm = {
  companyId: "",
  name: "",
  abbreviatedName: "",
  address: "",
  city: "",
  zip: "",
  countryCode: "",
  businessPhone: "",
  emailAddress: "",
  licenseNumber: "",
  laborUnion: "",
  isActive: "true",
  isConnected: "false",
  notes: "",
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-300";

function toInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function toSearchText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "number" || typeof value === "boolean") return String(value).toLowerCase();
  return Object.values(value as Record<string, unknown>)
    .map((item) => toSearchText(item))
    .join(" ");
}

function matchesSearch<T extends Record<string, unknown>>(record: T, search: string): boolean {
  if (!search) return true;
  return toSearchText(record).includes(search);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toDateTimeLocalValue(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

function toBooleanString(value: boolean): "true" | "false" {
  return value ? "true" : "false";
}

function vendorFormToRecord(form: VendorForm, existing?: VendorRecord): VendorRecord {
  return {
    id: existing?.id ?? 1,
    companyId: Number(form.companyId),
    name: form.name.trim(),
    abbreviatedName: form.abbreviatedName.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    zip: form.zip.trim(),
    countryCode: form.countryCode.trim().toUpperCase(),
    businessPhone: form.businessPhone.trim(),
    emailAddress: form.emailAddress.trim(),
    licenseNumber: form.licenseNumber.trim(),
    laborUnion: form.laborUnion.trim(),
    isActive: form.isActive === "true",
    isConnected: form.isConnected === "true",
    notes: form.notes.trim(),
    originCode: existing?.originCode ?? "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

function vendorRecordToForm(record: VendorRecord): VendorForm {
  return {
    companyId: String(record.companyId),
    name: record.name,
    abbreviatedName: record.abbreviatedName,
    address: record.address,
    city: record.city,
    zip: record.zip,
    countryCode: record.countryCode,
    businessPhone: record.businessPhone,
    emailAddress: record.emailAddress,
    licenseNumber: record.licenseNumber,
    laborUnion: record.laborUnion,
    isActive: toBooleanString(record.isActive),
    isConnected: toBooleanString(record.isConnected),
    notes: record.notes,
  };
}

function FieldShell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`text-sm text-slate-300 ${className}`.trim()}>
      {label}
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-100">{value || "-"}</div>
    </div>
  );
}

export default function DirectoryPage() {
  const [users, setUsers] = useState<UserRecord[]>(seedUsers);
  const [vendors, setVendors] = useState<VendorRecord[]>(seedVendors);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, normalizedSearch)),
    [normalizedSearch, users]
  );

  const filteredVendors = useMemo(
    () => vendors.filter((vendor) => matchesSearch(vendor, normalizedSearch)),
    [normalizedSearch, vendors]
  );

  useEffect(() => {
    if (!isCreateMenuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!createMenuRef.current) return;
      if (!createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isCreateMenuOpen]);

  function openCreateUser() {
    setIsCreateMenuOpen(false);
    setModal({
      kind: "create-user",
      mode: "create",
      draft: { ...emptyUserForm },
    });
  }

  function openCreateVendor() {
    setIsCreateMenuOpen(false);
    setModal({
      kind: "create-vendor",
      mode: "create",
      draft: { ...emptyVendorForm },
    });
  }

  function openUserDetails(userId: number) {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    setModal({ kind: "user", mode: "view", draft: { ...user } });
  }

  function openVendorDetails(vendorId: number) {
    const vendor = vendors.find((item) => item.id === vendorId);
    if (!vendor) return;
    setModal({ kind: "vendor", mode: "view", draft: { ...vendor } });
  }

  function closeModal() {
    setModal(null);
  }

  function startEditing() {
    setModal((current) => {
      if (!current || current.kind === "create-user" || current.kind === "create-vendor") return current;
      return { ...current, mode: "edit" };
    });
  }

  function saveModal() {
    if (!modal) return;

    if (modal.kind === "create-user") {
      const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
      const nextUser: UserRecord = {
        id: nextId,
        name: modal.draft.name.trim(),
        emailAddress: modal.draft.emailAddress.trim(),
        jobTitle: modal.draft.jobTitle.trim(),
        isEmployee: modal.draft.isEmployee === "true",
        employeeId: modal.draft.employeeId.trim(),
        countryCode: modal.draft.countryCode.trim().toUpperCase(),
        lastLoginAt: new Date().toISOString(),
      };

      setUsers((current) => [nextUser, ...current]);
      closeModal();
      return;
    }

    if (modal.kind === "create-vendor") {
      const nextId = vendors.length ? Math.max(...vendors.map((vendor) => vendor.id)) + 1 : 1;
      const nextVendor: VendorRecord = {
        ...vendorFormToRecord(modal.draft),
        id: nextId,
        originCode: `PROC-${String(1000 + nextId)}`,
        createdAt: new Date().toISOString(),
      };

      setVendors((current) => [nextVendor, ...current]);
      closeModal();
      return;
    }

    if (modal.kind === "user") {
      setUsers((current) =>
        current.map((user) => (user.id === modal.draft.id ? modal.draft : user))
      );
      closeModal();
      return;
    }

    setVendors((current) =>
      current.map((vendor) => (vendor.id === modal.draft.id ? modal.draft : vendor))
    );
    closeModal();
  }

  function updateCreateUserDraft<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setModal((current) => {
      if (!current || current.kind !== "create-user") return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          [key]: value,
        },
      };
    });
  }

  function updateCreateVendorDraft<K extends keyof VendorForm>(key: K, value: VendorForm[K]) {
    setModal((current) => {
      if (!current || current.kind !== "create-vendor") return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          [key]: value,
        },
      };
    });
  }

  function updateUserDraft<K extends keyof UserRecord>(key: K, value: UserRecord[K]) {
    setModal((current) => {
      if (!current || current.kind !== "user") return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          [key]: value,
        },
      };
    });
  }

  function updateVendorDraft<K extends keyof VendorRecord>(key: K, value: VendorRecord[K]) {
    setModal((current) => {
      if (!current || current.kind !== "vendor") return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          [key]: value,
        },
      };
    });
  }

  const showCreateButton = true;

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-8 text-white md:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Directory</h1>
            <p className="mt-1 text-slate-400">Users and vendors for demo construction workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              Back Home
            </Link>
            <Link
              href="/project-overview"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              Project
            </Link>
            {showCreateButton && (
              <div className="relative" ref={createMenuRef}>
              <button
                type="button"
                  onClick={() => setIsCreateMenuOpen((current) => !current)}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-400"
              >
                  Create
              </button>
                {isCreateMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-40 rounded-lg border border-slate-600 bg-slate-800 p-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={openCreateUser}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={openCreateVendor}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                    >
                      Vendor
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="search-directory">
            Search all records
          </label>
          <input
            id="search-directory"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by any field in users or vendors"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-700 pt-4">
            {(["all", "users", "vendors"] as TabKey[]).map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === "all" ? "All" : tab === "users" ? "Users" : "Vendors";
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-teal-500 text-white"
                      : "border border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {(activeTab === "all" || activeTab === "users") && (
          <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Users</h2>
                <p className="text-sm text-slate-400">Click a name to open quick view and edit details.</p>
              </div>
              <div className="text-sm text-slate-400">{filteredUsers.length} records</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-200">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Avatar</th>
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Email Address</th>
                    <th className="px-3 py-3 font-semibold">Job Title</th>
                    <th className="px-3 py-3 font-semibold">Employee</th>
                    <th className="px-3 py-3 font-semibold">Employee ID</th>
                    <th className="px-3 py-3 font-semibold">Country Code</th>
                    <th className="px-3 py-3 font-semibold">Last Login At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-700 text-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-bold text-orange-500">
                          {toInitials(user.name)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => openUserDetails(user.id)}
                          className="font-semibold text-teal-300 underline-offset-4 hover:underline"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="px-3 py-2">{user.emailAddress}</td>
                      <td className="px-3 py-2">{user.jobTitle}</td>
                      <td className="px-3 py-2">{formatBoolean(user.isEmployee)}</td>
                      <td className="px-3 py-2">{user.employeeId || "-"}</td>
                      <td className="px-3 py-2">{user.countryCode}</td>
                      <td className="px-3 py-2 text-slate-300">{user.lastLoginAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredUsers.length && (
                <div className="p-8 text-center text-sm text-slate-400">No users match your search.</div>
              )}
            </div>
          </section>
        )}

        {(activeTab === "all" || activeTab === "vendors") && (
          <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Vendors</h2>
                <p className="text-sm text-slate-400">Click a name to open quick view and edit details.</p>
              </div>
              <div className="text-sm text-slate-400">{filteredVendors.length} records</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="min-w-[1700px] w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-200">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Avatar</th>
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Abbreviated Name</th>
                    <th className="px-3 py-3 font-semibold">Company ID</th>
                    <th className="px-3 py-3 font-semibold">Address</th>
                    <th className="px-3 py-3 font-semibold">City</th>
                    <th className="px-3 py-3 font-semibold">Zip</th>
                    <th className="px-3 py-3 font-semibold">Country Code</th>
                    <th className="px-3 py-3 font-semibold">Business Phone</th>
                    <th className="px-3 py-3 font-semibold">Email Address</th>
                    <th className="px-3 py-3 font-semibold">License Number</th>
                    <th className="px-3 py-3 font-semibold">Labor Union</th>
                    <th className="px-3 py-3 font-semibold">Active</th>
                    <th className="px-3 py-3 font-semibold">Connected</th>
                    <th className="px-3 py-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-t border-slate-700 text-slate-100">
                      <td className="px-3 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-bold text-orange-500">
                          {toInitials(vendor.name)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => openVendorDetails(vendor.id)}
                          className="font-semibold text-teal-300 underline-offset-4 hover:underline"
                        >
                          {vendor.name}
                        </button>
                      </td>
                      <td className="px-3 py-2">{vendor.abbreviatedName}</td>
                      <td className="px-3 py-2">{vendor.companyId}</td>
                      <td className="px-3 py-2">{vendor.address}</td>
                      <td className="px-3 py-2">{vendor.city}</td>
                      <td className="px-3 py-2">{vendor.zip}</td>
                      <td className="px-3 py-2">{vendor.countryCode}</td>
                      <td className="px-3 py-2">{vendor.businessPhone}</td>
                      <td className="px-3 py-2">{vendor.emailAddress}</td>
                      <td className="px-3 py-2">{vendor.licenseNumber}</td>
                      <td className="px-3 py-2">{vendor.laborUnion}</td>
                      <td className="px-3 py-2">{formatBoolean(vendor.isActive)}</td>
                      <td className="px-3 py-2">{formatBoolean(vendor.isConnected)}</td>
                      <td className="max-w-72 truncate px-3 py-2 text-slate-300">{vendor.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredVendors.length && (
                <div className="p-8 text-center text-sm text-slate-400">No vendors match your search.</div>
              )}
            </div>
          </section>
        )}
      </div>

      {modal && modal.kind === "create-user" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create User</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                saveModal();
              }}
            >
              <FieldShell label="Name">
                <input
                  required
                  value={modal.draft.name}
                  onChange={(event) => updateCreateUserDraft("name", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Email Address">
                <input
                  type="email"
                  required
                  value={modal.draft.emailAddress}
                  onChange={(event) => updateCreateUserDraft("emailAddress", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Job Title">
                <input
                  required
                  value={modal.draft.jobTitle}
                  onChange={(event) => updateCreateUserDraft("jobTitle", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Employee">
                <select
                  value={modal.draft.isEmployee}
                  onChange={(event) => updateCreateUserDraft("isEmployee", event.target.value)}
                  className={inputClassName}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </FieldShell>

              <FieldShell label="Employee ID">
                <input
                  value={modal.draft.employeeId}
                  onChange={(event) => updateCreateUserDraft("employeeId", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Country Code">
                <input
                  required
                  maxLength={2}
                  value={modal.draft.countryCode}
                  onChange={(event) =>
                    updateCreateUserDraft("countryCode", event.target.value.toUpperCase())
                  }
                  className={`${inputClassName} uppercase`}
                />
              </FieldShell>

              <div className="md:col-span-2 mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-400"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal.kind === "create-vendor" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create Vendor</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                saveModal();
              }}
            >
              <FieldShell label="Company ID">
                <input
                  type="number"
                  required
                  value={modal.draft.companyId}
                  onChange={(event) => updateCreateVendorDraft("companyId", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Name">
                <input
                  required
                  value={modal.draft.name}
                  onChange={(event) => updateCreateVendorDraft("name", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Abbreviated Name">
                <input
                  required
                  value={modal.draft.abbreviatedName}
                  onChange={(event) => updateCreateVendorDraft("abbreviatedName", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Address">
                <input
                  required
                  value={modal.draft.address}
                  onChange={(event) => updateCreateVendorDraft("address", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="City">
                <input
                  required
                  value={modal.draft.city}
                  onChange={(event) => updateCreateVendorDraft("city", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Zip">
                <input
                  required
                  value={modal.draft.zip}
                  onChange={(event) => updateCreateVendorDraft("zip", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Country Code">
                <input
                  required
                  maxLength={2}
                  value={modal.draft.countryCode}
                  onChange={(event) =>
                    updateCreateVendorDraft("countryCode", event.target.value.toUpperCase())
                  }
                  className={`${inputClassName} uppercase`}
                />
              </FieldShell>

              <FieldShell label="Business Phone">
                <input
                  required
                  value={modal.draft.businessPhone}
                  onChange={(event) => updateCreateVendorDraft("businessPhone", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Email Address">
                <input
                  type="email"
                  required
                  value={modal.draft.emailAddress}
                  onChange={(event) => updateCreateVendorDraft("emailAddress", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="License Number">
                <input
                  required
                  value={modal.draft.licenseNumber}
                  onChange={(event) => updateCreateVendorDraft("licenseNumber", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Labor Union">
                <input
                  value={modal.draft.laborUnion}
                  onChange={(event) => updateCreateVendorDraft("laborUnion", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldShell label="Active">
                  <select
                    value={modal.draft.isActive}
                    onChange={(event) => updateCreateVendorDraft("isActive", event.target.value)}
                    className={inputClassName}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FieldShell>

                <FieldShell label="Connected">
                  <select
                    value={modal.draft.isConnected}
                    onChange={(event) => updateCreateVendorDraft("isConnected", event.target.value)}
                    className={inputClassName}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FieldShell>
              </div>

              <FieldShell label="Notes" className="md:col-span-2 xl:col-span-3">
                <textarea
                  rows={4}
                  value={modal.draft.notes}
                  onChange={(event) => updateCreateVendorDraft("notes", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <div className="md:col-span-2 xl:col-span-3 mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-400"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal.kind === "user" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">User Details</h2>
                <p className="text-sm text-slate-400">
                  {modal.mode === "view" ? "Read-only quick view" : "Editing user details"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {modal.mode === "view" ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-400"
                  >
                    Edit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailRow label="ID" value={String(modal.draft.id)} />
              <DetailRow label="Last Login At" value={formatDateTime(modal.draft.lastLoginAt)} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldShell label="Name">
                <input
                  value={modal.draft.name}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("name", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Email Address">
                <input
                  type="email"
                  value={modal.draft.emailAddress}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("emailAddress", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Job Title">
                <input
                  value={modal.draft.jobTitle}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("jobTitle", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Employee">
                <select
                  value={modal.draft.isEmployee ? "true" : "false"}
                  disabled={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("isEmployee", event.target.value === "true")}
                  className={inputClassName}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </FieldShell>

              <FieldShell label="Employee ID">
                <input
                  value={modal.draft.employeeId}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("employeeId", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Country Code">
                <input
                  value={modal.draft.countryCode}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateUserDraft("countryCode", event.target.value.toUpperCase())}
                  className={`${inputClassName} uppercase`}
                />
              </FieldShell>

              {modal.mode === "edit" && (
                <FieldShell label="Last Login At" className="md:col-span-2">
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(modal.draft.lastLoginAt)}
                    onChange={(event) =>
                      updateUserDraft("lastLoginAt", fromDateTimeLocalValue(event.target.value))
                    }
                    className={inputClassName}
                  />
                </FieldShell>
              )}
            </div>

            {modal.mode === "edit" && (
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveModal}
                  className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-400"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {modal && modal.kind === "vendor" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Vendor Details</h2>
                <p className="text-sm text-slate-400">
                  {modal.mode === "view" ? "Read-only quick view" : "Editing vendor details"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {modal.mode === "view" ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-400"
                  >
                    Edit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            {modal.mode === "view" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailRow label="ID" value={String(modal.draft.id)} />
                <DetailRow label="Origin Code" value={modal.draft.originCode} />
                <DetailRow label="Created At" value={formatDateTime(modal.draft.createdAt)} />
                <DetailRow label="Active" value={formatBoolean(modal.draft.isActive)} />
              </div>
            )}

            <div className={`${modal.mode === "view" ? "mt-5" : ""} grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3`}>
              <FieldShell label="Company ID">
                <input
                  type="number"
                  value={modal.draft.companyId}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("companyId", Number(event.target.value))}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Name">
                <input
                  value={modal.draft.name}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("name", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Abbreviated Name">
                <input
                  value={modal.draft.abbreviatedName}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("abbreviatedName", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Address">
                <input
                  value={modal.draft.address}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("address", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="City">
                <input
                  value={modal.draft.city}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("city", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Zip">
                <input
                  value={modal.draft.zip}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("zip", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Country Code">
                <input
                  value={modal.draft.countryCode}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("countryCode", event.target.value.toUpperCase())}
                  className={`${inputClassName} uppercase`}
                />
              </FieldShell>

              <FieldShell label="Business Phone">
                <input
                  value={modal.draft.businessPhone}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("businessPhone", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Email Address">
                <input
                  type="email"
                  value={modal.draft.emailAddress}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("emailAddress", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="License Number">
                <input
                  value={modal.draft.licenseNumber}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("licenseNumber", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <FieldShell label="Labor Union">
                <input
                  value={modal.draft.laborUnion}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("laborUnion", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>

              <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldShell label="Active">
                  <select
                    value={modal.draft.isActive ? "true" : "false"}
                    disabled={modal.mode === "view"}
                    onChange={(event) => updateVendorDraft("isActive", event.target.value === "true")}
                    className={inputClassName}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FieldShell>

                <FieldShell label="Connected">
                  <select
                    value={modal.draft.isConnected ? "true" : "false"}
                    disabled={modal.mode === "view"}
                    onChange={(event) => updateVendorDraft("isConnected", event.target.value === "true")}
                    className={inputClassName}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FieldShell>
              </div>

              <FieldShell label="Notes" className="md:col-span-2 xl:col-span-3">
                <textarea
                  rows={4}
                  value={modal.draft.notes}
                  readOnly={modal.mode === "view"}
                  onChange={(event) => updateVendorDraft("notes", event.target.value)}
                  className={inputClassName}
                />
              </FieldShell>
            </div>

            {modal.mode === "edit" && (
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveModal}
                  className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-400"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
