import { useRouter } from "next/navigation";
import { useState } from "react";
import { Facebook, Twitter, Linkedin, Mail, Phone, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";

interface ApiErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(false);
    setStatus(null);
    setLoading(true);
    
    try {
      await api.post("api/newsletter/subscribe", { name, email });
      setStatus({ type: 'success', message: 'Subscribed successfully!' });
      setEmail("");
      setName("");
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setStatus({ 
        type: 'error', 
        message: apiError.response?.data?.message || 'Failed to subscribe.' 
      });
    } finally {
      setLoading(false);
    }
  };

  function onNavigate(path: string): void {
    router.push(`/${path}`);
  }

  return (
    <footer className="bg-gradient-to-b from-[#1a2744] to-[#111c32] text-slate-300 pt-16 pb-8 px-4 z-20 relative overflow-hidden shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)]">
      {/* Top highlight line — more pronounced */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent shadow-[0_1px_10px_rgba(59,130,246,0.3)]" />

      {/* Subtle inner top glow for depth */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />

      {/* Soft radial glow — top left */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-blue-500/[0.06] blur-[100px] pointer-events-none" />

      {/* Soft radial glow — bottom right */}
      <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-indigo-400/[0.05] blur-[100px] pointer-events-none" />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link
              href="/landing"
              className="flex items-center gap-2.5 hover:opacity-80 transition w-fit"
            >
              <Image
                src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
                alt="FinoQz Logo"
                height={32}
                width={32}
                unoptimized
              />
              <span className="text-xl font-bold tracking-tight text-white">
                FinoQz
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Where smart finance learning becomes a daily habit. Empowering
              your financial journey through interactive, bite-sized education.
            </p>
            <div className="flex gap-3 mt-1">
              <SocialIcon
                href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61583983703581"
                icon={<Facebook className="h-4 w-4" />}
              />
              <SocialIcon
                href="https://x.com/FinoQz"
                icon={<Twitter className="h-4 w-4" />}
              />
              <SocialIcon
                href="https://www.linkedin.com/company/finoqz"
                icon={<Linkedin className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 font-medium text-white text-sm tracking-wide uppercase">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/aboutus")}
                >
                  About Us
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/mission")}
                >
                  Our Mission
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/vision")}
                >
                  Our Vision
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/contact")}
                >
                  Contact
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 font-medium text-white text-sm tracking-wide uppercase">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <FooterLink onClick={() => onNavigate("landing/pages/faq")}>
                  FAQs
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/privacy_policy")}
                >
                  Privacy Policy
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onNavigate("landing/pages/tos")}>
                  Terms of Service
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  onClick={() => onNavigate("landing/pages/refund")}
                >
                  Refund Policy
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="lg:col-span-4 lg:pl-8">
            <h3 className="mb-5 font-medium text-white text-sm tracking-wide uppercase">
              Get in Touch
            </h3>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>support@finoqz.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+91 8287755328</span>
              </li>
            </ul>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-3 max-w-sm">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/25 transition-colors placeholder:text-slate-500"
                />
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 focus-within:border-white/25 transition-colors">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-4 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-white transition-colors shrink-0 disabled:opacity-50"
                  >
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {status && (
                <p className={`text-xs px-2 ${status.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {status.message}
                </p>
              ) || (
                <p className="text-[10px] text-slate-500 px-2 italic">
                  *Get professional financial tips & quiz updates.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinoQz. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with ❤️ in India</span>
            <span className="hidden md:inline opacity-30">|</span>
            <span>Developed by @FinoQz_India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  icon,
  href,
}: {
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-full text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
    >
      {icon}
    </a>
  );
}

function FooterLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-slate-400 hover:text-white transition-colors text-left"
    >
      {children}
    </button>
  );
}
