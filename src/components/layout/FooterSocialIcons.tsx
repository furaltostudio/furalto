type SocialIconProps = {
  className?: string;
};

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.4" cy="7.6" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function PinterestIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8.5C10.6 8.5 9.5 9.6 9.5 11C9.5 11.8 9.9 12.5 10.5 12.9C10.3 14.2 9.9 15.4 9.4 16.5C10.8 16.1 12 15.2 12.8 14C13.5 14.3 14.3 14.5 15.1 14.5C17.2 14.5 18.8 12.7 18.8 10.6C18.8 8.2 16.8 6.2 14.4 6.2C11.4 6.2 9.5 8.4 9.5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 8.5H16.5V5.5H14.5C12.3 5.5 10.5 7.3 10.5 9.5V11H8V14H10.5V20.5H13.5V14H15.8L16.2 11H13.5V9.8C13.5 9.1 14.1 8.5 14.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YoutubeIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="17" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 10.2L14.5 12L11 13.8V10.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 8L12 13L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
