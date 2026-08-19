import Link from "next/link";
import {
  footerCompany,
  footerCustomerCare,
  footerLegalLinks,
  footerShop,
  type FooterLink,
} from "@/config/footer";
import { siteConfig } from "@/config/site";
import { FooterNewsletter } from "@/components/layout/FooterNewsletter";
import { FooterMobileMenus } from "@/components/layout/FooterMobileMenus";
import { Logo } from "@/components/layout/Logo";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PinterestIcon,
  YoutubeIcon,
} from "@/components/layout/FooterSocialIcons";
import { cn } from "@/lib/utils/cn";

type FooterProps = {
  footerDescription?: string;
  contact?: {
    email: string;
    phone: string;
    whatsapp?: string;
    address?: string;
    gstin?: string;
  };
  social?: {
    instagram: string;
    pinterest: string;
    facebook: string;
    youtube: string;
  };
};

function FooterLinkColumn({
  title,
  links,
  split,
}: {
  title: string;
  links: FooterLink[];
  split?: boolean;
}) {
  return (
    <div className="footer-column">
      <h3 className="footer-heading">{title}</h3>
      <ul className={cn("footer-links", split && "footer-links-split")}>
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className={cn("footer-link", link.highlight && "footer-link-accent")}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({
  footerDescription = siteConfig.footerDescription,
  contact = {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    address: siteConfig.contact.address,
    gstin: siteConfig.contact.gstin,
  },
  social = {
    instagram: siteConfig.social.instagram,
    pinterest: siteConfig.social.pinterest,
    facebook: siteConfig.social.facebook,
    youtube: siteConfig.social.youtube,
  },
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const whatsappDigits = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");

  const socialLinks = [
    { label: "Instagram", href: social.instagram, icon: InstagramIcon },
    { label: "Facebook", href: social.facebook, icon: FacebookIcon },
    { label: "Pinterest", href: social.pinterest, icon: PinterestIcon },
    { label: "YouTube", href: social.youtube, icon: YoutubeIcon },
    { label: "Email", href: `mailto:${contact.email}`, icon: MailIcon },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="footer-main mt-auto">
      <div className="footer-glow" aria-hidden="true" />

      <div className="container-app">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo variant="footer" className="footer-brand-logo" />
            <span className="footer-brand-rule" aria-hidden="true" />
            <p className="footer-brand-text">{footerDescription}</p>

            <div className="footer-contact">
              <a
                href={`tel:${contact.phone.replace(/\D/g, "")}`}
                className="footer-contact-link"
              >
                {contact.phone}
              </a>
              {whatsappDigits ? (
                <>
                  <span className="footer-contact-divider" aria-hidden="true" />
                  <a
                    href={`https://wa.me/${whatsappDigits.length === 10 ? `91${whatsappDigits}` : whatsappDigits}`}
                    className="footer-contact-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
              <span className="footer-contact-divider" aria-hidden="true" />
              <a href={`mailto:${contact.email}`} className="footer-contact-link">
                {contact.email}
              </a>
            </div>

            {contact.address ? (
              <p className="footer-address">{contact.address}</p>
            ) : null}

            <div className="footer-social">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={label === "Email" ? undefined : "_blank"}
                  rel={label === "Email" ? undefined : "noopener noreferrer"}
                  className="footer-social-icon"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <FooterMobileMenus />

          <div className="footer-desktop-menus hidden md:contents">
            <FooterLinkColumn title={footerShop.title} links={footerShop.links} split />
            <FooterLinkColumn
              title={footerCustomerCare.title}
              links={footerCustomerCare.links}
            />
            <FooterLinkColumn title={footerCompany.title} links={footerCompany.links} />
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container-app footer-bottom-inner">
          <p className="footer-copyright">
            © {currentYear} {siteConfig.name.toUpperCase()}. All rights reserved.
            {contact.gstin ? (
              <span className="footer-gstin">GSTIN: {contact.gstin}</span>
            ) : null}
          </p>

          <nav className="footer-legal" aria-label="Legal">
            {footerLegalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-legal-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
