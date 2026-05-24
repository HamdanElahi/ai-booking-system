import Link from "next/link";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Bot } from "lucide-react";

const DEMO_BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || "demo";

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold">
            <Bot className="h-5 w-5" />
            BookAI Demo
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a demo chat. Connect Supabase and set NEXT_PUBLIC_DEMO_BUSINESS_ID for a live demo.
          </p>
        </div>
        <ChatInterface businessId={DEMO_BUSINESS_ID} businessName="Demo Salon" />
      </div>
    </div>
  );
}
