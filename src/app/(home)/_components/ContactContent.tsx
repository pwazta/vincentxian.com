// Contact section content component
// Used in: Portfolio modal for Contact section

"use client";

import * as React from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "~/features/shared/components/ui/input";
import { Textarea } from "~/features/shared/components/ui/textarea";
import { Button } from "~/features/shared/components/ui/button";
import { SocialLinks } from "~/features/shared/components/SocialLinks";

// ── Types ───────────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function ContactContent() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";
    if (!message.trim()) newErrors.message = "Message is required";
    else if (message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to send message");
      }

      toast.success("Message sent successfully! I'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send message";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 px-8">
      {/* Header */}
      <div className="flex items-center gap-2 justify-center">
        <h2
          className="text-2xl font-semibold mb-1"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-mono)",
            textShadow:
              "2px 2px 0px color-mix(in srgb, var(--primary) 50%, transparent)",
          }}
        >
          get in touch!
        </h2>
        <Mail className="size-7 mb-2 ml-2 text-primary" />
      </div>

      {/* Introductory Paragraph */}
      <p className="text-foreground/90 text-center -mt-4">
        Want to work together or have a question? My inbox is open to everyone!
      </p>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Your Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address (For reply) <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            placeholder="xxx@xxx"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-1">
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            Message <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({ ...errors, message: undefined });
            }}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={isSubmitting}
            placeholder="Type your message here"
            rows={7}
            className="resize-y min-h-[100px]"
          />
          {errors.message && (
            <p id="message-error" className="text-sm text-destructive">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-start">
          <Button type="submit" disabled={isSubmitting} variant="default" className="cursor-pointer">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>

      {/* Social Links */}
      <div className="mb-2">
        <SocialLinks />
      </div>
    </div>
  );
}
