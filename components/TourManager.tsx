import React, { useState, useEffect } from 'react';
import ProgressiveTour from './ProgressiveTour';
import { useAppStore } from '@/hooks/app-store';
import {
  ownerProgressiveTour,
  technicianProgressiveTour,
  quickProgressiveTour,
} from '@/constants/progressive-tour-flows';

export type TourType = 'owner' | 'technician' | 'quick';

interface TourManagerProps {
  autoStart?: boolean;
  tourType?: TourType;
}

export default function TourManager({ autoStart = false, tourType }: TourManagerProps) {
  const { hasCompletedTour, completeTour, userRole } = useAppStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const getTourSteps = () => {
    if (tourType === 'quick') return quickProgressiveTour;
    if (tourType === 'technician') return technicianProgressiveTour;
    if (tourType === 'owner') return ownerProgressiveTour;
    
    return userRole === 'technician' ? technicianProgressiveTour : ownerProgressiveTour;
  };

  const tourSteps = getTourSteps();

  useEffect(() => {
    if (autoStart && !hasCompletedTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompletedTour]);

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsVisible(true);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setCurrentStepIndex(0);
  };

  const handleComplete = async () => {
    setIsVisible(false);
    setCurrentStepIndex(0);
    await completeTour();
  };

  if (!isVisible || currentStepIndex >= tourSteps.length) {
    return null;
  }

  return (
    <ProgressiveTour
      visible={isVisible}
      step={tourSteps[currentStepIndex]}
      totalSteps={tourSteps.length}
      currentStepNumber={currentStepIndex + 1}
      onNext={handleNext}
      onSkip={handleSkip}
      onComplete={handleComplete}
      isLastStep={currentStepIndex === tourSteps.length - 1}
    />
  );
}
