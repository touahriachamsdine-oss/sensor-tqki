import type { SVGProps } from 'react';

export function FsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
      <path d="M9 3v18" />
      <path d="M15 3h4a2 2 0 0 1 2 2v4.5" />
      <path d="m15 12-4-2v4l4-2z" className="text-primary fill-primary" />
      <path d="M15 12h4a2 2 0 0 0 2-2V7.5" />
    </svg>
  );
}
