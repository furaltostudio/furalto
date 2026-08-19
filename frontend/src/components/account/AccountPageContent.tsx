"use client";

import { Suspense } from "react";
import { AccountBenefitsAside } from "@/components/account/AccountBenefitsAside";
import { AccountBreadcrumb } from "@/components/account/AccountBreadcrumb";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AccountSignInForm } from "@/components/account/AccountSignInForm";
import { Reveal } from "@/components/ui/Reveal";
import { useAuth } from "@/providers/AuthProvider";

type AccountPageContentProps = {
  googleClientId?: string;
};

export function AccountPageContent({ googleClientId }: AccountPageContentProps) {
  const { user, isLoading, isAuthenticated, isStaff } = useAuth();

  const breadcrumb = isLoading ? "My Account" : isAuthenticated ? "My Account" : "Sign In";

  if (!isLoading && isAuthenticated) {
    return (
      <section className="account-page account-page--member">
        <div className="container-app account-page-inner">
          <AccountBreadcrumb current={breadcrumb} />
          <header className="account-member-header">
            <p className="account-panel-eyebrow">My Account</p>
            <h1>Hello, {user?.firstName || "there"}</h1>
            <p className="account-form-lead">
              {isStaff
                ? "Staff account — open the admin console anytime, or shop the storefront with this same login."
                : "Your orders, wishlists, and appointments are ready whenever you are."}
            </p>
          </header>
          <Reveal className="account-layout account-layout--member">
            <AccountDashboard />
            <AccountBenefitsAside variant="account" />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="account-page account-page--auth">
      <div className="container-app account-page-inner">
        <AccountBreadcrumb current={breadcrumb} />
        <Reveal className="account-layout account-layout--auth">
          {isLoading ? (
            <div className="account-form-panel account-loading-panel" aria-busy="true">
              <div className="account-loading-block account-loading-block-lg" />
              <div className="account-loading-block" />
              <div className="account-loading-block" />
              <div className="account-loading-block account-loading-block-sm" />
            </div>
          ) : (
            <Suspense fallback={<div className="account-form-panel account-loading-panel" />}>
              <AccountSignInForm googleClientId={googleClientId} />
            </Suspense>
          )}
          <AccountBenefitsAside variant="signin" />
        </Reveal>
      </div>
    </section>
  );
}
