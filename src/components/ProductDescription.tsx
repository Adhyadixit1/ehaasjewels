import { useState } from 'react';

interface ProductDescriptionProps {
  description: string;
  specifications: { [key: string]: string };
}

export default function ProductDescription({ description, specifications }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  return (
    <div className="border-t border-border">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('description')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'description'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'specs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Specifications
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        )}
        
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}