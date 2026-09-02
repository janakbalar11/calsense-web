import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconToday = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconLive = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 12h3l2 6 4-14 3 10 2-4h4" />
  </svg>
);

export const IconTrends = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 19V5M4 19h16" />
    <path d="M7 15l4-5 3 3 5-7" />
  </svg>
);

export const IconInsights = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.3V17h6v-1.2c0-.9.4-1.7 1-2.3A6 6 0 0 0 12 3Z" />
    <path d="M9 21h6" />
  </svg>
);

export const IconZones = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 21c4-3 7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 3 8 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconAssess = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconDevice = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="16" height="10" rx="3" />
    <path d="M19 10h2v4h-2" />
    <path d="M7 12h6" />
  </svg>
);

export const IconProfile = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const IconSun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);

export const IconMoon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" />
  </svg>
);

export const IconFoot = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 4c-2 0-3 2-3 5 0 2-1 3-1 6 0 3 2 4 4 4s3-2 3-4 0-3 0-6c0-3-1-5-3-5Z" />
    <circle cx="16" cy="6" r="1.4" />
    <circle cx="18" cy="9.5" r="1.2" />
    <circle cx="18" cy="13" r="1" />
  </svg>
);

export const IconPlay = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7 4v16l13-8Z" />
  </svg>
);

export const IconStop = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const IconReset = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 4v6h6" />
    <path d="M20 20v-6h-6" />
    <path d="M20 10a8 8 0 0 0-14-4L4 10M4 14a8 8 0 0 0 14 4l2-4" />
  </svg>
);
