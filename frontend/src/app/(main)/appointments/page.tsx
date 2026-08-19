import { AppointmentPageContent } from "@/components/appointments/AppointmentPageContent";
import { appointmentHeroImage } from "@/config/appointments";
import { fetchContentByKey } from "@/lib/content/fetch";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Make An Appointment",
  description:
    "Book a private Furalto design consultation at our Rohini Design Studio in New Delhi, or virtually. Request your appointment online.",
  path: "/appointments",
  ogImage: appointmentHeroImage.src,
});

export default async function AppointmentsPage() {
  const entry = await fetchContentByKey("page.appointments");
  const data = (entry?.data || {}) as Record<string, unknown>;
  const benefits = Array.isArray(data.benefits)
    ? data.benefits
        .map((item) => {
          const row = (item || {}) as Record<string, unknown>;
          return {
            title: typeof row.title === "string" ? row.title : "",
            description: typeof row.description === "string" ? row.description : "",
          };
        })
        .filter((item) => item.title)
    : undefined;

  return (
    <AppointmentPageContent
      eyebrow={typeof data.eyebrow === "string" ? data.eyebrow : undefined}
      title={typeof data.title === "string" ? data.title : undefined}
      description={typeof data.lead === "string" ? data.lead : undefined}
      benefits={benefits}
    />
  );
}
