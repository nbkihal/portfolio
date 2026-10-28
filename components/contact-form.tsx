"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { contact } from "@/content/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  // Detect whether a real Formspree endpoint has been wired up yet.
  const isConfigured = !contact.formspreeEndpoint.includes("your-form-id");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Fallback when Formspree isn't configured: open the mail client.
    if (!isConfigured) {
      const name = String(data.get("name") ?? "");
      const email = String(data.get("email") ?? "");
      const message = String(data.get("message") ?? "");
      const subject = encodeURIComponent(`Project inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch(contact.formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const json = (await res.json().catch(() => null)) as {
          errors?: { message?: string }[];
        } | null;
        setError(
          json?.errors?.[0]?.message ??
            "Something went wrong. Please try again.",
        );
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="font-display text-xl font-semibold">Message sent!</h3>
        <p className="text-muted-foreground">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Project details</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What are you trying to build?"
        />
      </div>

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Send message
          </>
        )}
      </Button>

      <div aria-live="polite" className="min-h-[1.25rem] text-sm">
        {status === "error" ? (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {!isConfigured ? (
          <p className="text-muted-foreground">
            Heads up: the form isn&apos;t connected to Formspree yet, so
            submitting will open your email client instead. See the README to
            wire it up.
          </p>
        ) : null}
      </div>
    </form>
  );
}
