import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Gift } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: Date;
  offerText?: string;
  discountPercentage?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate,
  offerText = "Limited Time Offer",
  discountPercentage = 20 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set target to 24 hours from now if not provided
  const effectiveTargetDate = useMemo(() => {
    return targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
  }, [targetDate]);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const difference = effectiveTargetDate.getTime() - now.getTime();

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    } else {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  }, [effectiveTargetDate]);

  useEffect(() => {
    const timeLeft = calculateTimeLeft();
    setTimeLeft(timeLeft);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <span className="font-bold text-lg">{offerText}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">{discountPercentage}% OFF</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Offer ends in:</span>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 text-center bg-white/20 rounded-lg py-2">
          <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs">Hours</div>
        </div>
        <div className="flex-1 text-center bg-white/20 rounded-lg py-2">
          <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs">Minutes</div>
        </div>
        <div className="flex-1 text-center bg-white/20 rounded-lg py-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl font-bold"
          >
            {timeLeft.seconds.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-xs">Seconds</div>
        </div>
      </div>
      
      <motion.div
        animate={{ width: ['100%', '0%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="h-1 bg-white/30 rounded-full mt-3"
      />
    </motion.div>
  );
};

export default CountdownTimer;
