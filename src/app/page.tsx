import { HomeBottomCta } from "@/components/home/home-bottom-cta";
import { HomeFeatures } from "@/components/home/home-features";
import { HomeHero } from "@/components/home/home-hero";

export default function Home() {
  return (
    <div className="pb-20">
      <HomeHero />
      <HomeFeatures />
      <HomeBottomCta />
    </div>
  );
}
