import {
  ClockIcon,
  FolderIcon,
  GithubIcon,
  ReceiveIcon,
  SendIcon,
  TextIcon,
  WarningIcon,
} from "./icons";

export const navItems = [
  { id: "file", label: "文件", icon: FolderIcon },
  { id: "text", label: "文本", icon: TextIcon },
  { id: "github", label: "GitHub", icon: GithubIcon, link: "https://github.com/ymzzz222/x2x" },
] as const;

export type NavTab = (typeof navItems)[number]["id"];

export const roleItems = [
  {
    role: "sender",
    title: "发送文件",
    description: "选择文件，生成一次性分享码，等待另一台设备加入。",
    icon: SendIcon,
  },
  {
    role: "receiver",
    title: "接收文件",
    description: "输入 6 位分享码，加入同一房间，确认保存方式后开始接收。",
    icon: ReceiveIcon,
  },
] as const;

export const grainientConfig = {
  color1: "#f4b7ff",
  color2: "#6047ff",
  color3: "#9d88da",
  timeSpeed: 0.16,
  grainAnimated: true,
  grainAmount: 0.06,
} as const;

export const phaseLabels = {
  idle: "待开始",
  "role-selected": "已选角色",
  "room-creating": "创建房间",
  "waiting-peer": "等待加入",
  "joining-room": "加入房间",
  negotiating: "建立连接",
  ready: "准备完成",
  transferring: "正在传输",
  completed: "已完成",
  cancelled: "已取消",
  failed: "已失败",
} as const;

export const statusItems = [
  {
    key: "wifi",
    label: "传输方式",
    value: "LAN WebRTC",
    icon: WarningIcon,
  },
  {
    key: "ttl",
    label: "房间时效",
    value: "10 分钟",
    icon: ClockIcon,
  },
] as const;

export const styles = {
  main: "relative min-h-screen overflow-hidden bg-[#09070d] text-white",
  section: "relative z-10 flex min-h-screen px-4 pt-16 pb-6 md:pt-5 md:px-6 md:py-7",
  container: "mx-auto flex w-full max-w-[1180px] gap-4",

  mobileBar:
    "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-4 md:hidden",
  mobileBarBack:
    "flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-white/50 transition-all active:scale-95 active:bg-white/[0.06]",
  mobileBarTitle: "text-sm font-medium text-white/70 tracking-wide",

  sidebar:
    "sticky top-5 hidden h-[calc(100vh-40px)] w-[60px] shrink-0 flex-col items-center md:flex sm:top-7 sm:h-[calc(100vh-56px)]",
  nav: "flex flex-1 flex-col items-center justify-center gap-1.5",
  navItem: "group relative",
  navButton: {
    base: "relative flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border transition-all duration-300 ease-out hover:scale-105",
    active:
      "border-white/20 bg-white/[0.12] text-white shadow-[0_0_20px_rgba(255,255,255,0.06)]",
    inactive:
      "border-transparent text-white/50 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/80",
  },
  navIcon: "h-[20px] w-[20px]",
  activeDot:
    "pointer-events-none absolute -right-px top-1/2 h-[7px] w-[7px] -translate-y-1/2 translate-x-[2px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]",
  tooltip:
    "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1720]/95 px-3 py-1.5 text-xs font-medium text-white/80 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 translate-x-[-4px]",
  aboutWrap: "pb-3",
  aboutLink:
    "flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-transparent text-white/35 transition-all duration-300 ease-out hover:scale-105 hover:border-white/[0.1] hover:bg-white/[0.06] hover:text-white/65",

  backWrap: "pt-1 pb-2",
  backButton:
    "flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-transparent text-white/40 transition-all duration-300 ease-out hover:scale-105 hover:border-white/[0.1] hover:bg-white/[0.06] hover:text-white/70",

  content: "flex min-w-0 flex-1 flex-col gap-4",
  centeredContent: "flex min-w-0 flex-1 flex-col justify-center gap-4",
  panel:
    "rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm",
  hero: "grid gap-5 rounded-[32px] border border-white/10 bg-[#120f19]/80 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr]",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.35em] text-white/42",
  title: "max-w-[12ch] text-3xl font-semibold tracking-tight text-white sm:text-4xl",
  lead: "max-w-[58ch] text-sm leading-7 text-white/66 sm:text-[15px]",
  heroMeta: "grid gap-3 sm:grid-cols-2",
  heroMetaCard:
    "rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70",
  heroMetaLabel: "mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/38",
  capabilityCallout:
    "rounded-[24px] border border-amber-400/25 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-50/90",

  roleGrid: "grid gap-3 w-full max-w-md mx-auto lg:max-w-none lg:grid-cols-2 lg:gap-4",
  roleCard: {
    base: "rounded-[22px] border px-4 py-4 text-left transition-all duration-300 ease-out sm:rounded-[28px] sm:px-5 sm:py-5",
    active: "border-white/18 bg-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.3)]",
    idle: "border-white/10 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06]",
  },
  roleIcon:
    "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80",
  roleTitle: "text-lg font-medium text-white",
  roleDescription: "mt-2 text-sm leading-6 text-white/58",

  flowGrid: "grid gap-4 xl:grid-cols-[1.2fr_0.8fr]",
  stack: "flex flex-col gap-4",
  innerPanel: "rounded-[20px] border border-white/10 bg-black/18 px-4 py-4 sm:rounded-[28px] sm:px-5 sm:py-5",
  panelTitle: "text-lg font-medium text-white",
  panelHint: "mt-1 text-sm text-white/46",

  dropzone: {
    base: "group/drop relative flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed px-5 text-center transition-all duration-300 ease-out cursor-pointer sm:min-h-[280px] sm:rounded-[28px] sm:gap-4",
    idle: "border-white/10 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.05]",
    dragging: "border-white/30 bg-white/[0.08] scale-[1.01]",
  },
  fileInput: "sr-only",
  uploadIcon:
    "flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05] text-white/70 transition-all duration-300 group-hover/drop:scale-105",
  dropTitle: "text-base font-medium text-white/88",
  dropHint: "text-sm text-white/42",

  fileList: "mt-4 flex flex-col gap-2",
  fileRow:
    "flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm",
  fileName: "min-w-0 truncate text-white/82",
  fileMeta: "shrink-0 text-xs text-white/42",

  codePanel: "rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5",
  codeWrap: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center",
  codeValue:
    "flex min-h-[56px] flex-1 items-center justify-center rounded-[20px] border border-white/12 bg-black/20 px-4 text-2xl font-semibold tracking-[0.28em] text-white sm:min-h-[68px] sm:rounded-[24px] sm:text-4xl",
  codePlaceholder:
    "flex min-h-[68px] flex-1 items-center justify-center rounded-[24px] border border-dashed border-white/12 bg-black/10 px-4 text-sm text-white/36",
  codeInput:
    "min-h-[56px] w-full rounded-[20px] border border-white/10 bg-black/20 px-4 text-center text-2xl tracking-[0.32em] text-white outline-none placeholder:text-white/18 focus:border-white/20",
  inlineMeta: "flex items-center gap-2 text-sm text-white/46",

  actionRow: "mt-4 flex flex-wrap gap-3",
  button: {
    primary:
      "inline-flex items-center justify-center rounded-full border border-white/16 bg-white/90 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white",
    secondary:
      "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.08] hover:text-white",
    ghost:
      "inline-flex items-center justify-center rounded-full border border-white/8 bg-transparent px-4 py-2.5 text-sm font-medium text-white/48 transition hover:border-white/14 hover:text-white/78",
    danger:
      "inline-flex items-center justify-center rounded-full border border-rose-300/16 bg-rose-300/10 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-300/16",
  },

  statusGrid: "grid gap-4 lg:grid-cols-[0.85fr_1.15fr]",
  statusPanel: "rounded-[28px] border border-white/10 bg-[#100d16]/88 px-5 py-5",
  statusTop: "flex items-start justify-between gap-4",
  statusLabel: "text-xs uppercase tracking-[0.24em] text-white/36",
  statusValue: "mt-2 text-2xl font-semibold text-white",
  statusText: "mt-3 text-sm leading-6 text-white/58",
  statePill: {
    ok: "inline-flex items-center rounded-full border border-emerald-300/16 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100",
    warn: "inline-flex items-center rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100",
    danger: "inline-flex items-center rounded-full border border-rose-300/16 bg-rose-300/10 px-3 py-1 text-xs font-medium text-rose-100",
    idle: "inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/56",
  },
  metaList: "mt-5 grid gap-3 sm:grid-cols-2",
  metaTile: "rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4",
  metaTileLabel: "text-xs uppercase tracking-[0.18em] text-white/34",
  metaTileValue: "mt-2 text-sm font-medium text-white/82",

  progressWrap: "space-y-4",
  progressBarOuter: "h-2 overflow-hidden rounded-full bg-white/10",
  progressBarInner: "h-full rounded-full bg-white transition-[width] duration-300",
  progressStats: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
  progressStat: "rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4",
  progressStatLabel: "text-xs uppercase tracking-[0.18em] text-white/34",
  progressStatValue: "mt-2 text-sm font-medium text-white/82",

  emptyState:
    "rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-white/40",
  warningState:
    "rounded-[24px] border border-amber-300/16 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-50/90",
  errorState:
    "rounded-[24px] border border-rose-300/18 bg-rose-300/10 px-4 py-4 text-sm leading-6 text-rose-50/90",

  linkList: "flex flex-col gap-2",
  linkItem:
    "flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm",
  linkAnchor: "text-white underline-offset-4 hover:underline",
} as const;
