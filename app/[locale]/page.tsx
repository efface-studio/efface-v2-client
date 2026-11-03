import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import EffaceIntro from "@/components/sections/EffaceIntro";
import Work from "@/components/sections/Work";
import CapabilitiesScene from "@/components/sections/CapabilitiesScene";
import Approach from "@/components/sections/Approach";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import ProfilePanel from "@/components/ProfilePanel";
import { BuildStage } from "@/components/BuildMode";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <span id="top" aria-hidden />
      <main>
        <Hero />
        <EffaceIntro />
        <Work />
        <CapabilitiesScene />
        <Approach />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ProfilePanel />
      <BuildStage />
    </>
  );
}
