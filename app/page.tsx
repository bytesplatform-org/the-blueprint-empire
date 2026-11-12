import Loader from "@/components/site/Loader";
import FilmTrail from "@/components/site/FilmTrail";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import ScrollReveals from "@/components/site/ScrollReveals";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Marquee from "@/components/home/Marquee";
import Cursor from "@/components/site/Cursor";
import ArcParallax from "@/components/site/ArcParallax";
import Intro from "@/components/home/Intro";
import Foundations from "@/components/home/Foundations";
import Programs from "@/components/home/Programs";
import Capabilities from "@/components/home/Capabilities";
import Agencies from "@/components/home/Agencies";
import Ecosystem from "@/components/home/Ecosystem";
import Founder from "@/components/home/Founder";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      {/* First in the body, so the loader paints before anything beneath it. */}
      <Loader />
      <FilmTrail />
      <SiteNav />
      <main id="top">
        <Hero />
        <Statement />
        <Intro />
        <Foundations />
        <Programs />
        <Capabilities />
        <Agencies />
        <Ecosystem />
        <Founder />
        <Marquee />
        <Contact />
      </main>
      <SiteFooter />
      <ArcParallax />
      <ScrollReveals />
      <Cursor />
    </>
  );
}
