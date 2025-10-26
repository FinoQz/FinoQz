"use client";

import Navbar from "../components/Navbar";
import ContactInfo from "./components/ContactInfo";
import SendEnquiryForm from "./components/SendEnquiryForm";
import Footer from "../components/Footer";


export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900 ">
            <Navbar />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mb-18">
                <ContactInfo />
                <SendEnquiryForm />
            </div>
            <Footer />
        </div>
    );
}
