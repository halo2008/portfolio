import React from 'react';
import { Cloud, Lock, Brain, Code } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const iconMap = {
  'Cloud': Cloud,
  'Lock': Lock,
  'Brain': Brain,
  'Code': Code
};

const TechStack: React.FC = () => {
  const { content } = useLanguage();

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-900/30 border-y border-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          {content.techStack.title}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.techStack.items.map((stack) => {
            const Icon = iconMap[stack.iconName];
            return (
              <div key={stack.category} className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center hover:border-slate-600 transition-colors">
                <div className="inline-flex p-4 rounded-full bg-slate-900 text-slate-300 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.items.map(item => (
                    <li key={item} className="text-sm text-slate-400 font-mono">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStack;