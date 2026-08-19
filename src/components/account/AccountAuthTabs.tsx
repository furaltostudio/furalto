import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type AccountAuthTabsProps = {
  active: "signin" | "signup";
};

export function AccountAuthTabs({ active }: AccountAuthTabsProps) {
  return (
    <nav className="account-auth-tabs" aria-label="Account options">
      <Link
        href="/account"
        className={cn("account-auth-tab", active === "signin" && "account-auth-tab-active")}
        aria-current={active === "signin" ? "page" : undefined}
      >
        Sign In
      </Link>
      <Link
        href="/account/signup"
        className={cn("account-auth-tab", active === "signup" && "account-auth-tab-active")}
        aria-current={active === "signup" ? "page" : undefined}
      >
        Create Account
      </Link>
    </nav>
  );
}
