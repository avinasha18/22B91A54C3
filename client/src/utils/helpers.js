export const validateURL = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  export const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return "Expired"
  
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
  
    if (days > 0) return `${days}d ${hours % 24}h remaining`
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s remaining`
    return `${seconds}s remaining`
  }
  
  export const generateShortCode = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  export const isExpired = (expiryTime) => {
    return new Date() > new Date(expiryTime)
  }
  
  export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }
  
  export const truncateURL = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }
  