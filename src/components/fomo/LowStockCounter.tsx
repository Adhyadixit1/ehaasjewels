import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockCounterProps {
  stockQuantity: number;
  threshold?: number;
}

const LowStockCounter: React.FC<LowStockCounterProps> = ({ 
  stockQuantity, 
  threshold = 10 
}) => {
  if (stockQuantity > threshold) return null;

  const getUrgencyLevel = () => {
    if (stockQuantity <= 2) return { color: 'text-red-600', bg: 'bg-red-50', text: 'Only 1 left!' };
    if (stockQuantity <= 5) return { color: 'text-orange-600', bg: 'bg-orange-50', text: `Only ${stockQuantity} left!` };
    return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: `Low stock: ${stockQuantity} remaining` };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${urgency.bg} ${urgency.color} text-sm font-medium`}>
      <AlertTriangle className="w-4 h-4" />
      <span>{urgency.text}</span>
      <Package className="w-4 h-4" />
    </div>
  );
};

export default LowStockCounter;