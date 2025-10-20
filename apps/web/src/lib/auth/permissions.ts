export type Role = "owner" | "admin" | "manager" | "staff";

export const can = {
  viewForecast: (r: Role) => r === "owner" || r === "admin" || r === "manager",
  publishWeeks: (r: Role)  => r === "owner" || r === "admin" || r === "manager",
  editShifts:   (r: Role)  => r === "owner" || r === "admin" || r === "manager",
  resolveAlerts:(r: Role)  => r === "owner" || r === "admin" || r === "manager",
  staffOnly:    (r: Role)  => r === "staff",
};