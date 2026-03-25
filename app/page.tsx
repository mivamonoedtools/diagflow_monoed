import { DiagramWorkbench } from "@/components/diagram-workbench";
import { DiagramToolGuide } from "@/components/diagram-tool-guide";
import { LandingHero } from "@/components/landing-hero";
import { getSiteOrigin, SITE_DESCRIPTION } from "@/lib/site-url";

export default function Home() {
  const origin = getSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Diagflow",
    description: SITE_DESCRIPTION,
    url: origin,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript.",
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHero />
      <DiagramWorkbench hidePageHeader />
      <DiagramToolGuide />
    </div>
  );
}
