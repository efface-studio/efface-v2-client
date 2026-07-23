import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import ServiceScroll from "@/components/sections/ServiceScroll";
import Approach from "@/components/sections/Approach";
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
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
