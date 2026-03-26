import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,

    // Valores responsive para usar en estilos
    r: (mobile, desktop, tablet) => {
      if (isMobile) return mobile;
      if (isTablet && tablet !== undefined) return tablet;
      return desktop;
    },
  };
}

// Ejemplos de uso:
// const { isMobile, r } = useResponsive();
// fontSize: r(14, 18)  // 14px en mobile, 18px en desktop
// padding: r('12px 16px', '24px 32px')  // diferentes padding
