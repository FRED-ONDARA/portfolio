import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { ClientChrome } from "@/components/ClientChrome";
import { Experience } from "@/components/Experience";
import { Focus } from "@/components/Focus";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Loader } from "@/components/Loader";
import { Marquee } from "@/components/Marquee";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { SkillsToolkit } from "@/components/SkillsToolkit";
import { resolveImages } from "@/lib/images";

export default function Home() {
  const { cutouts, screenshots } = resolveImages();

  return (
    <>
      <Loader />
      <Header />
      <main>
        <Hero figure={cutouts.hero} />
        <Marquee />
        <About figure={cutouts.about} />
        <Focus
          figures={{
            telecom: cutouts["focus-telecom"],
            robotics: cutouts["focus-robotics"],
            web: cutouts["focus-web"],
          }}
        />
        <Skills>
          <SkillsToolkit />
        </Skills>
        <Experience />
        <Projects screenshots={screenshots} />
        <Contact figure={cutouts.contact} />
      </main>
      <Footer />
      <ClientChrome />
    </>
  );
}
