'use client';

import HeroEditor from '../components/edit_landing/HeroEditor';
import CategoryEditor from '../components/edit_landing/CategoryEditor';
import WhyChooseEditor from '../components/edit_landing/WhyChooseEditor';
import DemoQuizEditor from '../components/edit_landing/DemoQuizEditor';

export default function EditLandingPage() {
  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <HeroEditor />
      <DemoQuizEditor />
      <CategoryEditor />
      <WhyChooseEditor />
      
    </div>
  );
}
