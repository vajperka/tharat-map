export type Role = "user" | "moderator" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Marker = {
  id: number;
  type: string;
  name: string;
  lat: number;
  lon: number;
  note: string;
  image_url: string | null;
  creature_slug?: string | null;
  creature_name?: string | null;
  creature_icon_url?: string | null;
  status: "verified" | "community" | "unverified";
  approval_status: ApprovalStatus;
  submitted_by: string | null;
  submitter_name?: string | null;
  submitter_avatar_url?: string | null;
  submitter_approved_count?: number;
  created_at: string;
  featured?: boolean;
};
