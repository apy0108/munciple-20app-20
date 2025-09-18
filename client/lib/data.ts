import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, Department, StaffUser } from "@shared/api";

export const departments: Department[] = [
  "Sanitation",
  "Roads",
  "Streetlights",
  "Water",
  "Public Works",
  "Electrical",
];

export const staff: StaffUser[] = [
  { id: "s1", name: "A. Sharma", role: "WARD_OFFICER", department: "Roads", ward: "W-12", location: { lat: 19.0825, lng: 72.7411 } },
  { id: "s2", name: "B. Patel", role: "WARD_OFFICER", department: "Sanitation", ward: "W-07", location: { lat: 19.104, lng: 72.85 } },
  { id: "s3", name: "C. Rao", role: "FIELD_STAFF", department: "Streetlights", ward: "W-22", location: { lat: 19.097, lng: 72.88 } },
  { id: "s4", name: "D. Singh", role: "FIELD_STAFF", department: "Water", ward: "W-03", location: { lat: 19.12, lng: 72.78 } },
];

export const categoryToDepartment: Record<ComplaintCategory, Department> = {
  pothole: "Public Works",
  garbage: "Sanitation",
  streetlight: "Electrical",
  water: "Water",
  sewage: "Water",
  other: "Public Works",
};

export function slaHoursFor(category: ComplaintCategory, priority: ComplaintPriority) {
  const base: Record<ComplaintPriority, number> = { HIGH: 24, MEDIUM: 48, LOW: 72 };
  return base[priority] + (category === "pothole" ? -8 : 0);
}

// Mumbai-ish bounds as example (lat/lng)
export const cityBounds = {
  minLat: 18.89,
  maxLat: 19.3,
  minLng: 72.75,
  maxLng: 73.05,
};

export function normalizeToBounds(lat: number, lng: number) {
  const x = (lng - cityBounds.minLng) / (cityBounds.maxLng - cityBounds.minLng);
  const y = 1 - (lat - cityBounds.minLat) / (cityBounds.maxLat - cityBounds.minLat);
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

export const sampleComplaints: Complaint[] = [
  {
    id: "c1",
    title: "Pothole near bus stop",
    description: "Large pothole causing traffic jams.",
    category: "pothole",
    department: categoryToDepartment["pothole"],
    priority: "HIGH",
    status: "NEW",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    slaHours: slaHoursFor("pothole", "HIGH"),
    location: { lat: 19.1, lng: 72.86, ward: "W-12", zone: "Zone A" },
    attachments: [{ type: "image", url: "/placeholder.svg" }],
    reporter: { name: "R. Mehta", contact: "+91-98XXXXXX", anonymous: false },
  },
  {
    id: "c2",
    title: "Garbage not collected",
    description: "Overflowing garbage bins for 3 days.",
    category: "garbage",
    department: categoryToDepartment["garbage"],
    priority: "MEDIUM",
    status: "ASSIGNED",
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    slaHours: slaHoursFor("garbage", "MEDIUM"),
    location: { lat: 19.2, lng: 72.92, ward: "W-07", zone: "Zone B" },
    attachments: [{ type: "image", url: "/placeholder.svg" }],
    reporter: { anonymous: true },
    assignedTo: "s2",
  },
  {
    id: "c3",
    title: "Streetlight flickering",
    description: "Streetlight near park is flickering at night.",
    category: "streetlight",
    department: categoryToDepartment["streetlight"],
    priority: "LOW",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    slaHours: slaHoursFor("streetlight", "LOW"),
    location: { lat: 19.05, lng: 72.81, ward: "W-22", zone: "Zone C" },
    attachments: [{ type: "image", url: "/placeholder.svg" }],
    assignedTo: "s3",
  },
  {
    id: "c4",
    title: "Water leakage",
    description: "Leakage visible on main road.",
    category: "water",
    department: categoryToDepartment["water"],
    priority: "HIGH",
    status: "ACCEPTED",
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    slaHours: slaHoursFor("water", "HIGH"),
    location: { lat: 19.18, lng: 72.98, ward: "W-03", zone: "Zone D" },
    attachments: [{ type: "image", url: "/placeholder.svg" }],
    assignedTo: "s4",
  },
];

export function routeDepartment(category: ComplaintCategory): Department {
  return categoryToDepartment[category];
}

export function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

export function nearestStaff(dept: Department, loc: { lat: number; lng: number }) {
  const candidates = staff.filter((s) => s.department === dept && s.location);
  if (candidates.length === 0) return undefined;
  return candidates.reduce((min, s) => (distance(s.location!, loc) < distance(min.location!, loc) ? s : min));
}

export function computeOverdue(c: Complaint) {
  const created = new Date(c.createdAt).getTime();
  const due = created + c.slaHours * 3600 * 1000;
  return Date.now() > due;
}
