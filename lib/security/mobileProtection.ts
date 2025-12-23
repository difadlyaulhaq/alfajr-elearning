
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const initializeMobileProtection = () => {
  if (typeof window === 'undefined') return;

  // Prevent context menu (long press)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { capture: true });

  // Disable text selection and touch callout
  document.documentElement.style.userSelect = 'none';
  document.documentElement.style.webkitUserSelect = 'none';
  
  // @ts-ignore
  document.documentElement.style.webkitTouchCallout = 'none';

  // Prevent drag
  window.addEventListener('dragstart', (e) => {
    e.preventDefault();
  }, { capture: true });
};
