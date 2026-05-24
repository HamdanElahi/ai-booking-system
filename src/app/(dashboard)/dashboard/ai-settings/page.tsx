"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Faq } from "@/types/database";
import { toast } from "sonner";

export default function AiSettingsPage() {
  const { business, refresh } = useBusiness();
  const [aiTone, setAiTone] = useState("friendly");
  const [customPrompt, setCustomPrompt] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (business) {
      setAiTone(business.ai_tone || "friendly");
      setCustomPrompt(business.ai_custom_prompt || "");
    }
  }, [business]);

  useEffect(() => {
    if (!business?.id) return;
    fetch(`/api/faqs?business_id=${business.id}`)
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs || []));
  }, [business?.id]);

  async function saveAiSettings() {
    if (!business?.id) return;
    const res = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: business.id,
        ai_tone: aiTone,
        ai_custom_prompt: customPrompt,
      }),
    });
    if (res.ok) {
      toast.success("AI settings saved");
      refresh();
    } else {
      toast.error("Failed to save settings");
    }
  }

  async function addFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!business?.id) return;
    const res = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: business.id, question, answer }),
    });
    if (res.ok) {
      toast.success("FAQ added");
      setQuestion("");
      setAnswer("");
      const data = await res.json();
      setFaqs((prev) => [...prev, data.faq]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Settings</h1>
        <p className="text-muted-foreground">Configure your AI receptionist tone and FAQs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chatbot personality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={aiTone} onValueChange={(v) => v && setAiTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Custom prompt</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Additional instructions for your AI receptionist..."
                rows={4}
              />
            </div>
            <Button onClick={saveAiSettings} disabled={!business}>
              Save AI settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addFaq} className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} required />
              </div>
              <Button type="submit" variant="outline" disabled={!business}>
                Add FAQ
              </Button>
            </form>
            <ul className="space-y-3">
              {faqs.map((f) => (
                <li key={f.id} className="rounded-lg border p-3">
                  <p className="font-medium">{f.question}</p>
                  <p className="text-sm text-muted-foreground">{f.answer}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
