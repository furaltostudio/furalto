import Link from "next/link";

type AccountBreadcrumbProps = {
  current: "Sign In" | "Create Account" | "My Account";
};

export function AccountBreadcrumb({ current }: AccountBreadcrumbProps) {
  return (
    <nav className="account-breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <span aria-hidden="true">/</span>
      <Link href="/account">Account</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}
