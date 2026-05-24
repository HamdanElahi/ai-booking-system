import Link from "next/link";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Bot, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("business_name")
    .eq("id", businessId)
    .single();

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="h-5 w-5" />
            BookAI
          </Link>
          <Button variant="outline" size="sm" render={<Link href={`/book/${businessId}`} />}>
            <Calendar className="mr-2 h-4 w-4" />
            Book directly
          </Button>
        </div>
        <ChatInterface
          businessId={businessId}
          businessName={business?.business_name}
        />
      </div>
    </div>
  );
}
