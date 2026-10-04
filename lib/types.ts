export type Role = "user" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Marker = {
  id: number;
  type: string;
  name: string;
  lat: number;
  lon: number;
  note: string;
  image_url: string | null;
  status: "verified" | "community" | "unverified";
  approval_status: ApprovalStatus;
  submitted_by: string | null;
  submitter_name?: string | null;
  created_at: string;
};
