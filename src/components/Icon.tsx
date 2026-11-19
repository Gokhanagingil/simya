/** Tüm simgeler kodla çizilmiş SVG'dir (emoji kullanılmaz). */
import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'back'
  | 'undo'
  | 'restart'
  | 'hint'
  | 'bottlePlus'
  | 'fogClear'
  | 'star'
  | 'starOutline'
  | 'crown'
  | 'dust'
  | 'lock'
  | 'book'
  | 'flask'
  | 'gear'
  | 'pyramid'
  | 'map'
  | 'play'
  | 'check'
  | 'close'
  | 'arrowDown'
  | 'key'
  | 'info';

const PATHS: Record<IconName, ReactElement> = {
  back: (
    <path
      d="M15 5 8 12l7 7"
      fill="none"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  undo: (
    <>
      <path
        d="M9 7 4 12l5 5"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12H14a5.5 5.5 0 0 1 0 11h-3"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform="translate(0 -4)"
      />
    </>
  ),
  restart: (
    <>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" fill="none" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M19.5 3.5v4.5H15"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  hint: (
    <>
      <path
        d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2V17h5v-1c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"
        fill="none"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 20h5" fill="none" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  bottlePlus: (
    <>
      <path
        d="M8 3h5M9 3v4l-3 4v8a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-8l-3-4V3"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M19 13v6M16 16h6" fill="none" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  fogClear: (
    <>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        fill="none"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" fill="none" strokeWidth="2.2" />
    </>
  ),
  star: (
    <path
      d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  ),
  starOutline: (
    <path
      d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z"
      fill="none"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  crown: (
    <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  dust: (
    <>
      <path
        d="M12 2.5l1.6 4.4 4.4 1.6-4.4 1.6L12 14.5l-1.6-4.4L6 8.5l4.4-1.6L12 2.5Z"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM6 15l.7 1.8 1.8.7-1.8.7L6 20l-.7-1.8-1.8-.7 1.8-.7L6 15Z"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" strokeWidth="1.8" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" strokeWidth="2.2" />
    </>
  ),
  book: (
    <>
      <path
        d="M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4V4.5ZM20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6V4.5Z"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  flask: (
    <>
      <path
        d="M9 3h6M10 3v6L4.8 18.2A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.8L14 9V3"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M7.5 15h9" fill="none" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" fill="none" strokeWidth="2" />
      <path
        d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="6.6" fill="none" strokeWidth="2" />
    </>
  ),
  pyramid: (
    <path
      d="M12 3 2.5 20h19L12 3ZM6.4 13h11.2M8.6 9h6.8M4.3 17h15.4"
      fill="none"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
  ),
  map: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" strokeWidth="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" fill="none" strokeWidth="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" fill="none" strokeWidth="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="none" strokeWidth="2" />
    </>
  ),
  play: <path d="M8 5v14l11-7L8 5Z" strokeWidth="1.5" strokeLinejoin="round" />,
  check: (
    <path
      d="m5 12.5 4.5 4.5L19 7.5"
      fill="none"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  close: <path d="M6 6l12 12M18 6 6 18" fill="none" strokeWidth="2.6" strokeLinecap="round" />,
  arrowDown: (
    <path
      d="M12 3v15M5.5 12 12 18.5 18.5 12"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" fill="none" strokeWidth="2.2" />
      <path d="M12 12h9M18 12v3.5M15 12v2.5" fill="none" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" />
      <path d="M12 11v6M12 7.5v.5" fill="none" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};

export function Icon({
  name,
  size = 28,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
