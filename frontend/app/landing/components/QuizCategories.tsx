"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Personal Finance",
    description: "Budgeting & saving essentials",
    topics: ["Budget Planning", "Emergency Funds", "Debt Management"],
    color: "text-blue-600 bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    name: "Accounting Basics",
    description: "Core accounting principles",
    topics: ["Double Entry", "Trial Balance", "Journal Entries"],
    color: "text-purple-600 bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    name: "Stock Market",
    description: "Stock Investing fundamentals",
    topics: ["Equity Basics", "Market Indices", "Trading Strategies"],
    color: "text-green-600 bg-green-50",
    iconColor: "text-green-600",
  },
  {
    name: "Taxation",
    description: "Understanding tax systems",
    topics: ["Income Tax", "GST & VAT", "Tax Planning"],
    color: "text-orange-600 bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    name: "Corporate Finance",
    description: "Business-level financial strategy",
    topics: ["Capital Budgeting", "Cost of Capital", "Financial Ratios"],
    color: "text-pink-600 bg-pink-50",
    iconColor: "text-pink-600",
  },
];

export default function QuizCategories() {
  return (
    <section id="categories" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#253A7B]">Explore Quiz Categories</h2>
          <p className="text-xl text-gray-600">
            Master various finance topics through structured learning paths
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className={`rounded-2xl shadow-md hover:shadow-lg transition ${cat.color}`}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{cat.name}</CardTitle>
                  <CardDescription className="text-sm">{cat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mt-2">
                    {cat.topics.map((topic, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${cat.iconColor}`} />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
