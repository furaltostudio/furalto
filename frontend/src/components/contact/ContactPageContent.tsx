"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { ServiceHubStrip } from "@/components/shared/ServiceHubStrip";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { customerCareHub } from "@/config/customer-care";
import {
  contactChannels,
  contactHeroImage,
  contactReasons,
  contactSubjects,
} from "@/config/contact";
import { contactService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";

type FormStatus = "idle" | "submitting" | "success";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

type ContactPageContentProps = {
  heroTitle?: string;
  heroDescription?: string;
  reasons?: Array<{ title: string; description: string }>;
  channels?: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
  };
};

export function ContactPageContent({
  heroTitle = "Contact Us",
  heroDescription = "Our design specialists are available to assist with orders, appointments, product guidance, and project planning.",
  reasons = [...contactReasons],
  channels = contactChannels,
}: ContactPageContentProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      await contactService.submit(form);
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("idle");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeroWithImage
        className="inquiry-hero"
        eyebrow="Customer Care"
        title={heroTitle}
        description={heroDescription}
        image={contactHeroImage}
      />

      <ServiceHubStrip links={customerCareHub} label="Customer Care" />

      <section className="inquiry-page">
        <div className="container-app inquiry-page-inner">
          <Reveal className="inquiry-layout">
            <div className="inquiry-form-panel">
              <p className="inquiry-panel-eyebrow">Write to Us</p>
              <span className="inquiry-panel-rule" aria-hidden="true" />
              <h2>Send a Message</h2>
              <p className="inquiry-form-lead">
                Complete the form below and a member of our team will respond within one business
                day.
              </p>

              {status === "success" ? (
                <div className="inquiry-success" role="status">
                  <h3>Thank you for reaching out</h3>
                  <p>
                    Your message has been received. A Furalto specialist will contact you at the
                    email or phone number provided within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="inquiry-success-reset"
                    onClick={() => setStatus("idle")}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="inquiry-form" onSubmit={handleSubmit}>
                  <div className="inquiry-form-grid">
                    <label>
                      <span>First Name</span>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        autoComplete="given-name"
                      />
                    </label>
                    <label>
                      <span>Last Name</span>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        autoComplete="family-name"
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder={contactChannels.phone}
                        autoComplete="tel"
                      />
                    </label>
                    <label className="inquiry-form-full">
                      <span>Subject</span>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        {contactSubjects.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inquiry-form-full">
                      <span>Message</span>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us how we can help — order details, product questions, or project scope."
                      />
                    </label>
                  </div>

                  {errorMessage ? (
                    <p className="account-form-error" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    className="inquiry-form-submit"
                    isLoading={status === "submitting"}
                    loadingText="Sending…"
                  >
                    Send Message
                    <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                  </Button>
                </form>
              )}
            </div>

            <aside className="inquiry-aside">
              <div className="inquiry-aside-card">
                <h3>Direct Contact</h3>
                <ul className="inquiry-contact-list">
                  <li>
                    <Phone aria-hidden="true" />
                    <div>
                      <span>Phone</span>
                      <a href={`tel:${channels.phone.replace(/\s/g, "")}`}>
                        {channels.phone}
                      </a>
                    </div>
                  </li>
                  <li>
                    <Mail aria-hidden="true" />
                    <div>
                      <span>Email</span>
                      <a href={`mailto:${channels.email}`}>{channels.email}</a>
                    </div>
                  </li>
                  <li>
                    <MessageCircle aria-hidden="true" />
                    <div>
                      <span>WhatsApp</span>
                      <a
                        href={`https://wa.me/${channels.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {channels.whatsapp}
                      </a>
                    </div>
                  </li>
                  <li>
                    <MapPin aria-hidden="true" />
                    <div>
                      <span>Business Address</span>
                      <p>{channels.address}</p>
                    </div>
                  </li>
                  <li>
                    <Clock aria-hidden="true" />
                    <div>
                      <span>Hours</span>
                      <p>{channels.hours}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="inquiry-aside-card">
                <h3>Prefer a Visit?</h3>
                <p>
                  Book a private consultation at one of our showrooms or schedule a virtual
                  design session.
                </p>
                <Link href="/appointments" className="inquiry-aside-link">
                  Make an Appointment
                </Link>
                <Link href="/showrooms" className="inquiry-aside-link-secondary">
                  View Showrooms
                </Link>
              </div>
            </aside>
          </Reveal>

          <Reveal className="inquiry-reasons reveal-stagger">
            {reasons.map((reason, index) => (
              <article key={reason.title} className="inquiry-reason-card">
                <span className="inquiry-reason-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
