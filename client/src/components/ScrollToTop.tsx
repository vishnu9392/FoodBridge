import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that navigating between pages always starts at the top
 * of the new page, without interfering with internal component state updates or modal scrolling.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if not navigating to a hash anchor link
    if (!window.location.hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }
  }, [pathname]);

  return null;
};
