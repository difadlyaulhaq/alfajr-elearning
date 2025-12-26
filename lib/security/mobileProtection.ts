
export interface GestureConfig {
  minMultiTouchCount: number;      // Minimum fingers to trigger (default: 3)
  palmRadiusThreshold: number;      // Max radius (px) for palm detection (default: 30)
  palmForceThreshold: number;       // Min force for strong pressure (default: 1)
  swipeDistanceThreshold: number;   // Min distance (px) for swipe (default: 50)
  swipeTimeout: number;             // Max time (ms) for swipe (default: 300)
}

const DEFAULT_CONFIG: GestureConfig = {
  minMultiTouchCount: 3,
  palmRadiusThreshold: 30,
  palmForceThreshold: 1,
  swipeDistanceThreshold: 50,
  swipeTimeout: 300,
};

export interface ViolationEvent {
  type: string;
  timestamp: number;
  details?: any;
}

type ViolationCallback = (event: ViolationEvent) => void;

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const requestDeviceMotionPermission = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && typeof (window as any).DeviceMotionEvent !== 'undefined' && typeof ((window as any).DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permissionState = await ((window as any).DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      return false;
    }
  }
  return true;
};

export const initializeMobileProtection = (
  onViolation?: ViolationCallback,
  customConfig?: Partial<GestureConfig>
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const activePointers = new Map<number, PointerEvent>();
  const swipeStartTimes = new Map<number, number>();
  const swipeStartPositions = new Map<number, { x: number; y: number }>();

  // --- Helper Functions ---

  const detectPalmSwipe = (pointer: PointerEvent): boolean => {
    // Cast to any because radiusX/radiusY might be missing in some TS definitions
    const p = pointer as any;
    return (
      (p.radiusX > config.palmRadiusThreshold) ||
      (p.radiusY > config.palmRadiusThreshold) ||
      (pointer.pressure > config.palmForceThreshold)
    );
  };

  const detectSwipe = (pointerId: number): boolean => {
    const startTime = swipeStartTimes.get(pointerId);
    const startPos = swipeStartPositions.get(pointerId);
    
    if (!startTime || !startPos) return false;

    const endTime = Date.now();
    const timeDelta = endTime - startTime;

    if (timeDelta > config.swipeTimeout) return false;

    const currentEvent = activePointers.get(pointerId);
    if (!currentEvent) return false;

    const deltaX = Math.abs(currentEvent.clientX - startPos.x);
    const deltaY = Math.abs(currentEvent.clientY - startPos.y);

    return (deltaX > config.swipeDistanceThreshold) || (deltaY > config.swipeDistanceThreshold);
  };

  // --- Event Handlers ---

  const handlePointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, e);
    swipeStartTimes.set(e.pointerId, Date.now());
    swipeStartPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 1. Detect Multi-Touch (Screenshot Android/Xiaomi)
    if (activePointers.size >= config.minMultiTouchCount) {
      onViolation?.({
        type: 'mobile_screenshot_gesture',
        timestamp: Date.now(),
        details: { pointerCount: activePointers.size }
      });
      return;
    }

    // 2. Detect Palm Swipe (Samsung) at start
    if (detectPalmSwipe(e)) {
      onViolation?.({
        type: 'mobile_palm_gesture',
        timestamp: Date.now(),
        details: { radiusX: (e as any).radiusX, pressure: e.pressure }
      });
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, e);

    // 3. Detect Swipe
    if (detectSwipe(e.pointerId)) {
      // Optional: Uncomment to penalize fast swipes if needed
      // onViolation?.({
      //   type: 'mobile_swipe_gesture',
      //   timestamp: Date.now(),
      //   details: { deltaX: e.movementX, deltaY: e.movementY }
      // });
      
      // Cleanup to prevent multiple triggers
      swipeStartTimes.delete(e.pointerId);
      swipeStartPositions.delete(e.pointerId);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    swipeStartTimes.delete(e.pointerId);
    swipeStartPositions.delete(e.pointerId);
  };

  const handlePointerCancel = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    swipeStartTimes.delete(e.pointerId);
    swipeStartPositions.delete(e.pointerId);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onViolation?.({ type: 'mobile_context_menu', timestamp: Date.now() });
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    onViolation?.({ type: 'mobile_drag_start', timestamp: Date.now() });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Best effort detection for physical buttons
    if (
      e.key === 'VolumeUp' || 
      e.key === 'VolumeDown' || 
      e.key === 'Power' || 
      e.code === 'VolumeUp' || 
      e.code === 'VolumeDown'
    ) {
      onViolation?.({ 
        type: 'mobile_hardware_button', 
        timestamp: Date.now(),
        details: { key: e.key }
      });
    }
  };

  // Prevent context menu (long press)
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });

  // Disable text selection and touch callout
  const originalUserSelect = document.documentElement.style.userSelect;
  const originalWebkitUserSelect = document.documentElement.style.webkitUserSelect;
  // @ts-ignore
  const originalWebkitTouchCallout = document.documentElement.style.webkitTouchCallout;

  document.documentElement.style.userSelect = 'none';
  document.documentElement.style.webkitUserSelect = 'none';
  // @ts-ignore
  document.documentElement.style.webkitTouchCallout = 'none';

  // Pointer Events Registration
  const options: AddEventListenerOptions = { capture: true, passive: false };
  window.addEventListener('pointerdown', handlePointerDown, options);
  window.addEventListener('pointermove', handlePointerMove, options);
  window.addEventListener('pointerup', handlePointerUp, options);
  window.addEventListener('pointercancel', handlePointerCancel, options);

  // Legacy & other listeners
  window.addEventListener('dragstart', handleDragStart, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('dragstart', handleDragStart, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });

    window.removeEventListener('pointerdown', handlePointerDown, options);
    window.removeEventListener('pointermove', handlePointerMove, options);
    window.removeEventListener('pointerup', handlePointerUp, options);
    window.removeEventListener('pointercancel', handlePointerCancel, options);

    document.documentElement.style.userSelect = originalUserSelect;
    document.documentElement.style.webkitUserSelect = originalWebkitUserSelect;
    // @ts-ignore
    document.documentElement.style.webkitTouchCallout = originalWebkitTouchCallout;
    
    activePointers.clear();
    swipeStartTimes.clear();
    swipeStartPositions.clear();
  };
};
