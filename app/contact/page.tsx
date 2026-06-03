"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Get in touch
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Contact us
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Have questions about our equipment or services? Reach out and we&apos;ll
            respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-md">
              <div className="border-b border-slate-200 px-5 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Contact information
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    body: (
                      <>
                        123 Industrial Park Road
                        <br />
                        Shelton, CT 06484
                      </>
                    ),
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    body: (
                      <a
                        href="tel:+1234567890"
                        className="text-slate-700 hover:text-accent transition-colors"
                      >
                        +1 (234) 567-890
                      </a>
                    ),
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    body: (
                      <a
                        href="mailto:info@sheltontoolhire.com"
                        className="text-slate-700 hover:text-accent transition-colors break-all"
                      >
                        info@sheltontoolhire.com
                      </a>
                    ),
                  },
                  {
                    icon: Clock,
                    label: "Business hours",
                    body: (
                      <>
                        Mon – Sat: 7:00 AM – 6:00 PM
                        <br />
                        Sunday: Closed
                      </>
                    ),
                  },
                ].map(({ icon: Icon, label, body }) => (
                  <div key={label} className="flex items-start gap-3 px-5 py-3">
                    <div className="h-8 w-8 shrink-0 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{label}</p>
                      <div className="text-slate-600 mt-0.5">{body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md h-48 flex items-center justify-center text-sm text-slate-500">
              Map integration
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-md">
              <div className="border-b border-slate-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Send us a message
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Your name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="rental">Equipment rental</option>
                      <option value="quote">Request a quote</option>
                      <option value="support">Technical support</option>
                      <option value="corporate">Corporate account</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-none"
                    placeholder="Tell us about your project or question..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
                >
                  <Send className="w-4 h-4" />
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
