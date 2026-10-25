import HeroSection from "@/components/ui/hero-01-utils/hero";
import type { NavigationSection } from "@/components/ui/hero-01-utils/header";
import Header from "@/components/ui/hero-01-utils/header";
import BrandSlider, {
  BrandList,
} from "@/components/ui/hero-01-utils/brand-slider";
import type { AvatarList } from "@/components/ui/hero-01-utils/hero";
import { GradientBars } from "@/components/ui/gradient-bars-background";

type AgencyHeroSectionProps = {
  navigationData?: NavigationSection[];
  avatarList?: AvatarList[];
  brandList?: BrandList[];
};

export default function AgencyHeroSection({
  navigationData,
  avatarList,
  brandList,
}: AgencyHeroSectionProps = {}) {
  const currentAvatarList: AvatarList[] = avatarList || [
    {
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const currentNavigationData: NavigationSection[] = navigationData || [
    {
      title: "Home",
      href: "/",
      isActive: true,
    },
    {
      title: "Challenges",
      href: "/problems",
    },
    {
      title: "About us",
      href: "/privacy",
    },
    {
      title: "Services",
      href: "/terms",
    },
    {
      title: "Pricing",
      href: "/tokens",
    },
    {
      title: "Calibration",
      href: "/admin/calibrate",
    },
  ];

  const currentBrandList: BrandList[] = brandList || [
    {
      image:
        "https://cdn.21st.dev/assets/localized/d824c259df6b2b2962fbef96e68a6877cab689b19246e3dc34ac9e7b144d32bd.svg",
      lightimg:
        "https://cdn.21st.dev/assets/localized/15cd724e2a038ed1415820ee25349eac7dfadec7f9359ae3800c13856ecb8b13.svg",
      name: "Brand 1",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/266083df0c7d0633f145889af4700d18e62b8f2c068fd8ab73d5a94b87a5a5cb.svg",
      lightimg:
        "https://cdn.21st.dev/assets/localized/ae83ac635485a392bac5c1723e98d6820d3587f762fdbde63cd462d7edea7c0d.svg",
      name: "Brand 2",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/91d1c562d12ba69aa7525d3782c6c6223b90e302073d59769dfce665ab9a83b7.svg",
      lightimg:
        "https://cdn.21st.dev/assets/localized/23d52f6aa5bbc765b65d5253b6578ed0e9213956a21be149f679cc79e2b0259e.svg",
      name: "Brand 3",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/f50b06ae2b7bf86d199b0ac986a47442f4a198d2f6dd81a9fe83c43022608498.svg",
      lightimg:
        "https://cdn.21st.dev/assets/localized/4cd93b1d1133feffdf8eba4431f93c14b538120c74285f39fe7ad1c6e48f7b53.svg",
      name: "Brand 4",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/3ad67ddda671655df765a507c9bcc7b67e4138a1ffe903ace17cef99c5c972a3.svg",
      lightimg:
        "https://cdn.21st.dev/assets/localized/6ee9f831a7c1cb87c14308a9d687fbd5fb2f319abee03d306b78730421410354.svg",
      name: "Brand 5",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(10,10,10)] dark">
      <GradientBars numBars={15} gradientFrom="rgb(255, 60, 0)" className="opacity-50" />
      <div className="relative z-10">
        <Header navigationData={currentNavigationData} />
        <div>
          <HeroSection avatarList={currentAvatarList} />
          <BrandSlider brandList={currentBrandList} />
        </div>
      </div>
    </div>
  );
}
