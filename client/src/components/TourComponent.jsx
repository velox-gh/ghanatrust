
import { Joyride, STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';
import { useAuth } from '../context/AuthContext';

const TourComponent = () => {
  const { runTour, stopTour } = useTour();
  const { isAuthenticated } = useAuth();

  const allSteps = [
    {
      target: '.tour-home',
      content: 'Welcome to GhanaTrust! Your trusted marketplace for finding verified service providers in Ghana.',
      disableBeacon: true,
    },
    {
      target: '.tour-find-services',
      content: 'Click here to browse our directory of plumbers, electricians, mechanics, and more.',
    },
    {
      target: '.tour-how-it-works',
      content: 'You can restart this tour anytime by clicking "How Trust Works".',
    },
    {
      target: '.tour-dashboard',
      content: 'Manage your bookings, payments, and profile from your Dashboard.',
      requiresAuth: true,
    },
    {
      target: '.tour-join',
      content: 'Ready to get started? Join GhanaTrust to book services or offer your own!',
      requiresAuth: false,
    },
  ];

  const steps = allSteps.filter(step => 
    step.requiresAuth === undefined || step.requiresAuth === isAuthenticated
  );

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      stopTour();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#059669', // emerald-600
          zIndex: 10000,
        },
      }}
    />
  );
};

export default TourComponent;
