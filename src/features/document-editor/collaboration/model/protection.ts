export const permissions = ["comment", "copy", "print", "download", "duplicate"] as const;
export type Permission = typeof permissions[number];
export type Classification = "normal" | "internal" | "restricted";
export type ProtectionPolicy = {
  classification: Classification;
  watermark: boolean;
  externalShare: boolean;
  allowed: Record<Permission, boolean>;
  rules: Partial<Record<"view" | "edit", Record<Permission, boolean>>>;
  approval: Classification | null;
  accessCount: number | null;
  audit: { id: number; operation: string; at: string; author: string }[];
};

export const classificationLabels: Record<Classification, string> = {
  normal: "普通",
  internal: "内部",
  restricted: "受限",
};

export const permissionLabels: Record<Permission, string> = {
  comment: "评论",
  copy: "复制正文",
  print: "打印",
  download: "下载正文",
  duplicate: "创建副本",
};

export const auditLabels: Record<string, string> = {
  settings: "修改数据保护设置",
  approve: "批准密级降低",
  decline: "拒绝密级降低",
  sharing: "更新分享",
  transfer: "转移所有权",
  restore: "还原版本",
  permissions: "修改访问权限",
};

export function allows(policy: ProtectionPolicy | undefined, action: Permission) {
  return policy?.allowed[action] !== false;
}
