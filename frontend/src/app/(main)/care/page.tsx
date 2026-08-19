import { CarePageContent } from "@/components/care/CarePageContent";
import { fetchContentByKey } from "@/lib/content/fetch";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Product Care",
  description: "Care and maintenance guides for Furalto furniture.",
  path: "/care",
});

export default async function CareIndexPage() {
  const entry = await fetchContentByKey("page.care");
  const data = (entry?.data || {}) as Record<string, string>;

  return (
    <CarePageContent
      title={data.title || "Care & Maintenance"}
      description={
        data.description ||
        "Preserve the beauty of your Furalto pieces with room-by-room guidance and material-specific care."
      }
    />
  );
}
