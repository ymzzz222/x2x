function BaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" fill="none" stroke="currentColor" {...props} />;
}

export function FolderIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.75 7.5h5l1.9 2.25h9.6v6.75a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25Z" />
      <path d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h3.75l1.5 1.5H18a2.25 2.25 0 0 1 2.25 2.25v.75" />
    </BaseIcon>
  );
}

export function TextIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.25 6.75h13.5" />
      <path d="M5.25 11.25h9.75" />
      <path d="M5.25 15.75h13.5" />
      <path d="M5.25 20.25h7.5" />
    </BaseIcon>
  );
}

export function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.76-.24.76-.54v-1.9c-3.1.67-3.75-1.32-3.75-1.32-.5-1.27-1.23-1.6-1.23-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.12 1.68 1.12.98 1.68 2.56 1.2 3.19.92.1-.7.39-1.2.7-1.47-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.43-2.22 1.13-3-.12-.28-.49-1.42.1-2.95 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.54 0c2.12-1.44 3.04-1.14 3.04-1.14.6 1.53.23 2.67.11 2.95.7.78 1.12 1.78 1.12 3 0 4.3-2.62 5.24-5.11 5.52.4.35.75 1.04.75 2.1v3.1c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-8 w-8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16.5V3" />
      <path d="m8.25 7.5 3.75-3.75 3.75 3.75" />
      <path d="M3.75 15v2.25A2.25 2.25 0 0 0 6 19.5h12a2.25 2.25 0 0 0 2.25-2.25V15" />
    </BaseIcon>
  );
}

export function SendIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-6 w-6"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 19.5 20.25 12 4.5 4.5l2.25 6.75h6.75" />
      <path d="M6.75 11.25h6.75" />
    </BaseIcon>
  );
}

export function ReceiveIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-6 w-6"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v13.5" />
      <path d="m8.25 12.75 3.75 3.75 3.75-3.75" />
      <path d="M4.5 19.5h15" />
    </BaseIcon>
  );
}

export function ShareIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-4 w-4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757" />
      <path d="M10.81 15.312a4.5 4.5 0 0 1-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
    </BaseIcon>
  );
}

export function CheckIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-4 w-4"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4.5 12.75 6 6 9-13.5" />
    </BaseIcon>
  );
}

export function ClockIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-4 w-4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5v4.5l3 1.5" />
    </BaseIcon>
  );
}

export function WarningIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-4 w-4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8.25v4.5" />
      <path d="M12 16.5h.008" />
      <path d="M10.65 3.87 3.66 16.005A1.5 1.5 0 0 0 4.96 18.25h14.08a1.5 1.5 0 0 0 1.3-2.245L13.35 3.87a1.5 1.5 0 0 0-2.7 0Z" />
    </BaseIcon>
  );
}

export function BackIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-[20px] w-[20px]"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12h-15m0 0 6.75-6.75M4.5 12l6.75 6.75" />
    </BaseIcon>
  );
}

export function AboutIcon() {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.75" />
      <path d="M12 15v-4.5" />
      <circle cx="12" cy="7.875" r="0.375" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}
