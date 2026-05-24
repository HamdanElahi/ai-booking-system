import {
  DemoSection,
  Features,
  Footer,
  Header,
  Hero,
} from "@/components/landing/landing-sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <DemoSection />
      </main>
      <Footer />
    </>
  );
}
