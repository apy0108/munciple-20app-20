import type { Complaint, Department, UserRole } from "@shared/api";

export function scopeComplaints(
  user: { id: string; role: UserRole; department?: Department; ward?: string },
  complaints: Complaint[],
): Complaint[] {
  switch (user.role) {
    case "SUPER_ADMIN":
      return complaints;
    case "DEPT_ADMIN":
      return complaints.filter((c) => c.department === user.department);
    case "WARD_OFFICER":
      return complaints.filter((c) => c.location.ward === user.ward);
    case "FIELD_STAFF":
      return complaints.filter((c) => c.assignedTo === user.id);
    default:
      return [];
  }
}
