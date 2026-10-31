import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Focus } from "@/components/Focus";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Loader } from "@/components/Loader";
import { Projects } from "@/components/Projects";
import { resolveImages } from "@/lib/images";

export default function Home() {
  const { cutouts, screenshots } = resolveImages();

  return (
    <>
      <Loader />
      <Header />
      <main>
        <Hero figure={cutouts.hero} />
        <About figure={cutouts.about} />
        <Focus
          figures={{
            telecom: cutouts["focus-telecom"],
            robotics: cutouts["focus-robotics"],
            web: cutouts["focus-web"],
          }}
        />
        <Projects screenshots={screenshots} />
        <Contact figure={cutouts.contact} />
      </main>
      <Footer />
      <Experience />
    </>
  );
}
