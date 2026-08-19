"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  appointmentBenefits,
  appointmentHeroImage,
  appointmentInterests,
  appointmentTimes,
  appointmentTypes,
  showroomOptions,
} from "@/config/appointments";
import { businessContact } from "@/config/contact";
import { appointmentService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";

type FormStatus = "idle" | "submitting" | "success";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  showroom: "",
  appointmentType: "",
  preferredDate: "",
  preferredTime: "",
  interest: "",
  message: "",
};

type AppointmentPageContentProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  benefits?: Array<{ title: string; description: string }>;
};

export function AppointmentPageContent({
  eyebrow = "Design Services",
  title = "Make An Appointment",
  description = "Book a private consultation with a Furalto design specialist — at our Rohini Design Studio in New Delhi, or virtually from anywhere.",
  benefits = [...appointmentBenefits],
}: AppointmentPageContentProps) {
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
      await appointmentService.submit(form);
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("idle");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <PageHeroWithImage
        eyebrow={eyebrow}
        title={title}
        description={description}
        image={appointmentHeroImage}
      />

      <section className="inquiry-page">
        <div className="container-app py-12 sm:py-16 lg:py-20">
          <Reveal className="inquiry-layout">
            <div className="inquiry-form-panel">
              <h2>Request an Appointment</h2>
              <p className="inquiry-form-lead">
                Share your preferences below. Our team will confirm your appointment by email or
                phone within one business day.
              </p>

              {status === "success" ? (
                <div className="inquiry-success" role="status">
                  <h3>Appointment Request Received</h3>
                  <p>
                    Thank you. A design specialist will reach out shortly to confirm your preferred
                    date, time, and showroom location.
                  </p>
                  <button
                    type="button"
                    className="inquiry-success-reset"
                    onClick={() => setStatus("idle")}
                  >
                    Book Another Appointment
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
                        placeholder={businessContact.phone}
                        autoComplete="tel"
                      />
                    </label>
                    <label className="inquiry-form-full">
                      <span>Appointment Type</span>
                      <select
                        name="appointmentType"
                        value={form.appointmentType}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select appointment type
                        </option>
                        {appointmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inquiry-form-full">
                      <span>Preferred Location</span>
                      <select
                        name="showroom"
                        value={form.showroom}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select showroom or virtual
                        </option>
                        {showroomOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Preferred Date</span>
                      <input
                        type="date"
                        name="preferredDate"
                        value={form.preferredDate}
                        onChange={handleChange}
                        min={minDate}
                        required
                      />
                    </label>
                    <label>
                      <span>Preferred Time</span>
                      <select
                        name="preferredTime"
                        value={form.preferredTime}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select time
                        </option>
                        {appointmentTimes.map((time) => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inquiry-form-full">
                      <span>Primary Interest</span>
                      <select
                        name="interest"
                        value={form.interest}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          What are you furnishing?
                        </option>
                        {appointmentInterests.map((interest) => (
                          <option key={interest.value} value={interest.value}>
                            {interest.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inquiry-form-full">
                      <span>Project Details</span>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Share room dimensions, timeline, inspiration, or specific pieces you're considering."
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
                    loadingText="Submitting…"
                  >
                    Request Appointment
                  </Button>
                </form>
              )}
            </div>

            <aside className="inquiry-aside">
              <div className="inquiry-aside-card">
                <h3>Before Your Visit</h3>
                <ul className="inquiry-aside-list">
                  <li>Floor plans or room measurements, if available</li>
                  <li>Inspiration images or Pinterest boards</li>
                  <li>Fabric and finish preferences</li>
                  <li>Delivery timeline and budget range</li>
                </ul>
              </div>

              <div className="inquiry-aside-card">
                <h3>Need Help First?</h3>
                <p>
                  For order updates or general questions, our customer care team is available by
                  phone and email.
                </p>
                <Link href="/contact" className="inquiry-aside-link">
                  Contact Customer Care
                </Link>
                <Link href="/showrooms" className="inquiry-aside-link-secondary">
                  View Showroom Hours
                </Link>
              </div>
            </aside>
          </Reveal>

          <Reveal className="inquiry-reasons reveal-stagger">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="inquiry-reason-card">
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
