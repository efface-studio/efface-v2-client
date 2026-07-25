import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import ServiceScroll from "@/components/sections/ServiceScroll";
import AppCards from "@/components/sections/AppCards";
import Capabilities from "@/components/sections/Capabilities";
import Approach from "@/components/sections/Approach";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

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
        <ServiceScroll />
        <AppCards />
        <Capabilities />
        <Approach />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
