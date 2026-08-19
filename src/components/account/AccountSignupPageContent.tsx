"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountBenefitsAside } from "@/components/account/AccountBenefitsAside";
import { AccountBreadcrumb } from "@/components/account/AccountBreadcrumb";
import { AccountSignupForm } from "@/components/account/AccountSignupForm";
import { Reveal } from "@/components/ui/Reveal";
import { useAuth } from "@/providers/AuthProvider";

type AccountSignupPageContentProps = {
  googleClientId?: string;
};

export function AccountSignupPageContent({ googleClientId }: AccountSignupPageContentProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/account");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <section className="account-page account-page--auth">
      <div className="container-app account-page-inner">
        <AccountBreadcrumb current="Create Account" />
        <Reveal className="account-layout account-layout--auth">
          {isLoading ? (
            <div className="account-form-panel account-loading-panel" aria-busy="true">
              <div className="account-loading-block account-loading-block-lg" />
              <div className="account-loading-block" />
              <div className="account-loading-block" />
            </div>
          ) : (
            <AccountSignupForm googleClientId={googleClientId} />
          )}
          <AccountBenefitsAside variant="signup" />
        </Reveal>
      </div>
    </section>
  );
}
