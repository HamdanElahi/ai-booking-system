import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Calendar, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Bot className="h-6 w-6 text-primary" />
          <span>BookAI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#demo" className="hover:text-foreground transition-colors">
            Demo
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button render={<Link href="/signup" />} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-purple-600" />
          AI-powered virtual receptionist
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          Automate appointments with your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI receptionist
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          BookAI helps salons, clinics, gyms, and consultants capture leads,
          answer FAQs, and schedule appointments 24/7 — without manual work.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" render={<Link href="/signup" />} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Start free trial
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/chat/demo" />}>
            Try AI demo
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const features = [
    {
      title: "AI Chatbot",
      description:
        "Conversational booking and FAQ handling that feels human — available 24/7.",
    },
    {
      title: "Smart Scheduling",
      description:
        "Real-time availability checks prevent double bookings and missed slots.",
    },
    {
      title: "Business Dashboard",
      description:
        "Manage appointments, services, and analytics from one clean interface.",
    },
    {
      title: "Automated Reminders",
      description:
        "Email and WhatsApp reminders reduce no-shows and keep customers informed.",
    },
  ];

  return (
    <section id="features" className="border-t bg-muted/30 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Everything you need to automate bookings</h2>
          <p className="text-muted-foreground">
            Built for small businesses that want to stop missing leads.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoSection() {
  return (
    <section id="demo" className="px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold">See it in action</h2>
        <p className="mb-8 text-muted-foreground">
          Try our AI receptionist demo — book an appointment in under 60 seconds.
        </p>
        <Button size="lg" render={<Link href="/chat/demo" />} className="bg-gradient-to-r from-blue-600 to-purple-600">
          Open chat demo
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2 font-semibold">
          <Bot className="h-5 w-5" />
          BookAI
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BookAI. AI appointment booking for modern businesses.
        </p>
      </div>
    </footer>
  );
}
