"use client";

import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Fill up the form and our team will get back to you within 24 hours.
        </p>
      </div>

      <div className="space-y-8">
        <ContactRow
          icon={<Mail className="w-5 h-5 text-[#253A7B]" />}
          title="Email Us"
          value="support@finoqz.com"
          link="mailto:support@finoqz.com"
        />
        <ContactRow
          icon={<Phone className="w-5 h-5 text-[#253A7B]" />}
          title="Call Us"
          value="+91 8287755328"
          link="tel:+918287755328"
        />
        <ContactRow
          icon={<MapPin className="w-5 h-5 text-[#253A7B]" />}
          title="Our Office"
          value="Noida Extension, Uttar Pradesh, India"
        />
      </div>

      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#253A7B]" />
          </div>
          <h3 className="font-medium text-gray-900">Live Chat</h3>
        </div>
        <p className="text-sm text-gray-500 ml-13">
          Available Monday to Friday, 9am – 6pm IST.
        </p>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  title,
  value,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  link?: string;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{title}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block hover:opacity-70 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}
