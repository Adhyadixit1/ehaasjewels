import React, { useState, useEffect } from 'react';
import { Flame, Truck, Gift, Clock, Users } from 'lucide-react';

interface UrgencyMessage {
  id: string;
  icon: React.ReactNode;
  text: string;
  subtext: string;
  color: string;
  bgColor: string;
}

const URGENCY_MESSAGES: UrgencyMessage[] = [
  // Removed the "Limited time offer" message as requested
];

const UrgencyMessaging: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState<UrgencyMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showRandomMessage = () => {
    // Check if there are any messages to show
    if (URGENCY_MESSAGES.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * URGENCY_MESSAGES.length);
    setCurrentMessage(URGENCY_MESSAGES[randomIndex]);
    setIsVisible(true);
  };

  useEffect(() => {
    // Start showing messages after 5 seconds
    const initialTimer = setTimeout(() => {
      showRandomMessage();
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(hideTimer);
    } else if (currentMessage) {
      // Schedule next message after current one is hidden
      const nextTimer = setTimeout(() => {
        showRandomMessage();
      }, Math.random() * 8000 + 12000); // 12-20 seconds gap

      return () => clearTimeout(nextTimer);
    }
  }, [isVisible, currentMessage]);

  // Don't render anything if there are no messages
  if (URGENCY_MESSAGES.length === 0) return null;

  return (
    <>
      {isVisible && currentMessage && (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${currentMessage.bgColor} ${currentMessage.color} text-sm font-medium shadow-sm border`}>
          <div className={currentMessage.color}>
            {currentMessage.icon}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{currentMessage.text}</span>
            <span className="text-xs opacity-75">{currentMessage.subtext}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UrgencyMessaging;