/**
 * Contact section content component
 * Used in: Portfolio modal for Contact section
 */
"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { Input } from "~/features/shared/components/ui/input";
import { Textarea } from "~/features/shared/components/ui/textarea";
import { Button } from "~/features/shared/components/ui/button";
import { SocialLinks } from "~/features/shared/components/SocialLinks";

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactContent() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS configuration is missing");
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        },
        publicKey
      );

      toast.success("Message sent successfully! I'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
    } catch (error) {
      console.error("EmailJS error:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
      <p className="text-foreground/90 text-center">
        Have a question or want to work together? I&apos;m always happy to
        discuss projects or other stuff!
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
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
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
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            placeholder="xxx@xxx"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
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
              if (errors.message) {
                setErrors({ ...errors, message: undefined });
              }
            }}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={isSubmitting}
            placeholder="Type your message here"
            rows={5}
            className="resize-y"
          />
          {errors.message && (
            <p id="message-error" className="text-sm text-destructive">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-start">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
          >
            {isSubmitting ? "Sending..." : "Send"}
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
