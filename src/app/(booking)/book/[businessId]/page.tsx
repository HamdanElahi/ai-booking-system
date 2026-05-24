import Link from "next/link";
import { BookingForm } from "@/components/booking/booking-form";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function BookPage({
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
          <Button variant="outline" size="sm" render={<Link href={`/chat/${businessId}`} />}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat with AI
          </Button>
        </div>
        <BookingForm
          businessId={businessId}
          businessName={business?.business_name}
        />
      </div>
    </div>
  );
}
