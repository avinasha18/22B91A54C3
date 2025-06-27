// Frontend logger utility that uses the shared logger

let sharedLog = null;

// Dynamically import the shared logger if possible
(async () => {
  try {
    // Adjust the path as needed for your build setup
    sharedLog = (await import('../../../shared/log')).Log;
  } catch (e) {
    // If import fails (e.g., in production build), fallback to a no-op
    sharedLog = null;
  }
})();

export const Log = (stack, level, pkg, message) => {
  // Only log if sharedLog is available
  if (typeof sharedLog === 'function') {
    sharedLog(stack, level, pkg, message);
  } else {
    // Fallback: log to console for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${stack}][${level}][${pkg}]`, message);
    }
  }
};
