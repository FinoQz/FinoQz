"use client";

import { Facebook, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoImage from "@/public/finoqz.svg"; // adjust path as needed
import { useRouter } from "next/navigation";

export default function Footer() {

    const router = useRouter();

    function onNavigate(path: string): void {
        router.push(`/${path}`);
    }


    return (
        <footer className="bg-gray-900 text-white py-12 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                        <Link href="/" className="flex items-center gap-2 mb-1 hover:opacity-80 transition">
                            <Image src={logoImage} alt="FinoQz Logo" className="h-8 w-8" />
                            <span className="text-xl font-semibold">FinoQz</span>
                        </Link>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Where smart finance learning becomes a daily habit
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => onNavigate("landing/aboutus")} className="hover:text-white transition">About Us</button></li>
                            <li><button onClick={() => onNavigate("landing/courses")} className="hover:text-white transition">Courses</button></li>
                            <li><button onClick={() => onNavigate("landing/certificate")} className="hover:text-white transition">Certificates</button></li>
                            <li><button onClick={() => onNavigate("landing/contact")} className="hover:text-white transition">Contact</button></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => onNavigate("landing/faq")} className="hover:text-white transition">FAQs</button></li>
                            <li><button onClick={() => onNavigate("landing/privacy_policy")} className="hover:text-white transition">Privacy Policy</button></li>
                            <li><button onClick={() => onNavigate("landing/tos")} className="hover:text-white transition">Terms of Service</button></li>
                            <li><button onClick={() => onNavigate("landing/refund")} className="hover:text-white transition">Refund Policy</button></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="mb-4 font-semibold text-white">Connect</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: support@finoqz.com</li>
                            <li>Phone: +91 8287755328</li>
                            <li className="pt-2">
                                <div className="flex gap-3">
                                    <a href="https://www.facebook.com/FinoQz" target="_blank" rel="noopener noreferrer"><SocialIcon icon={<Facebook className="h-5 w-5" />} /></a>
                                    <a href="https://x.com/FinoQz" target="_blank" rel="noopener noreferrer"><SocialIcon icon={<Twitter className="h-5 w-5" />} /></a>
                                    <a href="https://www.linkedin.com/company/finoqz" target="_blank" rel="noopener noreferrer"><SocialIcon icon={<Linkedin className="h-5 w-5" />} /></a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                    <p>© 2025 FinoQz. All rights reserved. Made with ❤️ in India  |   Developed by @Freelancer_Digitech</p>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <div className="bg-gray-800 p-2 rounded hover:bg-gray-700 cursor-pointer transition">
            {icon}
        </div>
    );
}
