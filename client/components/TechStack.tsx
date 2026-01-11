import React from 'react';
import { Cloud, Lock, Brain, Code, Wifi } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const iconMap: Record<string, React.ElementType> = {
  'Cloud': Cloud,
  'Lock': Lock,
  'Brain': Brain,
  'Code': Code,
  'Wifi': Wifi
};

const TechStack: React.FC = () => {
  const { content } = useLanguage();
  const { techStack } = content;

  return (
    <div className="mt-24">
      <div className="flex items-center gap-3 mb-10 text-white font-bold text-2xl">
        <Code className="text-primary" size={24} />
        <h3>{techStack.title}</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {techStack.items.map((category, index) => {
          const Icon = iconMap[category.iconName] || Code;

          return (
            <div
              key={index}
              className="bg-surface border border-slate-700 p-6 rounded-sm relative overflow-hidden group hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 bg-darker border border-slate-700 rounded-sm text-primary">
                  <Icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">{category.category}</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-darker border border-slate-700 text-slate-300 font-mono text-xs rounded-sm hover:border-slate-500 hover:text-white transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechStack;