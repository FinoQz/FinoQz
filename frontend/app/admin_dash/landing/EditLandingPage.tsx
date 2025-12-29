'use client';

import HeroEditor from './components/HeroEditor';
import CategoryEditor from './components/CategoryEditor';
import WhyChooseEditor from './components/WhyChooseEditor';
import DemoQuizEditor from './components/DemoQuizEditor';

export default function EditLandingPage() {
  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <HeroEditor />
      <CategoryEditor />
      <WhyChooseEditor />
      <DemoQuizEditor />
    </div>
  );
}
