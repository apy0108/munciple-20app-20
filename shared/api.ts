/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type UserRole =
  | "SUPER_ADMIN"
  | "DEPT_ADMIN"
  | "WARD_OFFICER"
  | "FIELD_STAFF";

export type Department =
  | "Sanitation"
  | "Roads"
  | "Streetlights"
  | "Water"
  | "Public Works"
  | "Electrical";

export type ComplaintCategory =
  | "pothole"
  | "garbage"
  | "streetlight"
  | "water"
  | "sewage"
  | "other";

export type ComplaintStatus =
  | "NEW"
  | "ACCEPTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Location {
  lat: number;
  lng: number;
  ward: string; // e.g. W-12
  zone: string; // e.g. Zone A
}

export interface ReporterInfo {
  name?: string;
  contact?: string;
  anonymous?: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department: Department;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  slaHours: number; // service level agreement window in hours
  location: Location;
  attachments?: { type: "image" | "video"; url: string }[];
  reporter?: ReporterInfo;
  assignedTo?: string; // userId or staff name
}

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  department?: Department;
  ward?: string;
  location?: { lat: number; lng: number };
}

export interface AnalyticsSnapshot {
  byStatus: Record<ComplaintStatus, number>;
  byDepartment: Record<string, number>;
  resolutionRate: number; // 0..1
  avgResolutionHours: number;
}
