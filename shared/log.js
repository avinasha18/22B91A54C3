// Shared logging middleware for both frontend and backend
export const Log = async (stack, level, pkg, message) => {
  try {
    // Validate required parameters
    if (!stack || !level || !pkg || !message) {
      console.error('Log: Missing required parameters');
      return;
    }

    // Validate stack value
    if (!['frontend', 'backend'].includes(stack)) {
      console.error('Log: Invalid stack value. Must be "frontend" or "backend"');
      return;
    }

    // Validate level value
    if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
      console.error('Log: Invalid level value. Must be one of: debug, info, warn, error, fatal');
      return;
    }

    // Official allowed packages from documentation
    const backendOnly = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
    const frontendOnly = ['api', 'component', 'hook', 'page', 'state', 'style'];
    const shared = ['auth', 'config', 'middleware', 'utils'];
    let validPackages = [];
    if (stack === 'backend') {
      validPackages = backendOnly.concat(shared);
    } else {
      validPackages = frontendOnly.concat(shared);
    }
    if (!validPackages.includes(pkg)) {
      console.error(`Log: Invalid package value for ${stack}. Must be one of: ${validPackages.join(', ')}`);
      return;
    }

    const logData = {
      stack,
      level,
      package: pkg,
      message
    };

    const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0ZWphc3NyaWF2aW5hc2hhQGdtYWlsLmNvbSIsImV4cCI6MTc1MTAwNDAyOSwiaWF0IjoxNzUxMDAzMTI5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGE2N2QyYTctMDVlOS00OWIxLTg4OTgtZjdkMjFlOTgxZDNlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicnlhbGkgdGVqYXNzcmkgYXZpbmFzaGEiLCJzdWIiOiIyNGM2NWM0Ny0xNTkyLTQyZTgtYmNlZS0zODBiNmNmNTkwZGIifSwiZW1haWwiOiJ0ZWphc3NyaWF2aW5hc2hhQGdtYWlsLmNvbSIsIm5hbWUiOiJyeWFsaSB0ZWphc3NyaSBhdmluYXNoYSIsInJvbGxObyI6IjIyYjkxYTU0YzMiLCJhY2Nlc3NDb2RlIjoieFdQTlh0IiwiY2xpZW50SUQiOiIyNGM2NWM0Ny0xNTkyLTQyZTgtYmNlZS0zODBiNmNmNTkwZGIiLCJjbGllbnRTZWNyZXQiOiJYRkJnR1lwUXZRYWJ6TVhLIn0.IeSAls1q6aaPUNGLNHE3i0pRBZOAyzBQwsGyUO09yRQ"
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Log API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (err) {
    console.error("Failed to log error:", err);
  }
};

//  functions for different log levels
export const logDebug = (stack, pkg, message) => Log(stack, 'debug', pkg, message);
export const logInfo = (stack, pkg, message) => Log(stack, 'info', pkg, message);
export const logWarn = (stack, pkg, message) => Log(stack, 'warn', pkg, message);
export const logError = (stack, pkg, message) => Log(stack, 'error', pkg, message);
export const logFatal = (stack, pkg, message) => Log(stack, 'fatal', pkg, message); 