import { CustomConfigurator } from "@/components/custom/CustomConfigurator";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Custom Furniture Studio",
  description:
    "Compose a bespoke Furalto sofa or bed with Studio AI. Choose catalogue silhouettes, tune materials, get Gemini pairing guidance, and request a made-to-order estimate.",
  path: "/custom",
  keywords: [
    "custom furniture India",
    "bespoke sofa",
    "made to order bed",
    "Furalto custom studio",
    "AI furniture design",
    "bespoke lounge",
  ],
});

export default function CustomFurniturePage() {
  return (
    <section className="custom-studio-page">
      <div className="container-app">
        <CustomConfigurator />
      </div>
    </section>
  );
}
