import { Log } from "../utils/logger"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Network error" }))
    console.error("API Error Response:", errorData)
    throw new Error(errorData.message || `HTTP ${response.status}`)
  }
  const data = await response.json()
  console.log("API Success Response:", data)
  return data
}

export const createShortURL = async (urlData) => {
  try {
    Log("frontend", "info", "api", `Creating short URL for: ${urlData.longURL}`)
    console.log("API Request: POST", `${API_BASE_URL}/shorturls`, urlData)

    const response = await fetch(`${API_BASE_URL}/shorturls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(urlData),
    })

    const result = await handleResponse(response)
    Log("frontend", "info", "api", `Successfully created short URL: ${result.data.shortcode}`)
    return result.data
  } catch (error) {
    Log("frontend", "error", "api", `Failed to create short URL: ${error.message}`)
    throw error
  }
}

export const getURLStats = async (shortcode) => {
  try {
    Log("frontend", "debug", "api", `Fetching stats for: ${shortcode}`)
    console.log("API Request: GET", `${API_BASE_URL}/shorturls/${shortcode}`)

    const response = await fetch(`${API_BASE_URL}/shorturls/${shortcode}`)
    const result = await handleResponse(response)

    Log("frontend", "info", "api", `Successfully fetched stats for: ${shortcode}`)
    return result.data
  } catch (error) {
    Log("frontend", "error", "api", `Failed to fetch stats for ${shortcode}: ${error.message}`)
    throw error
  }
}

export const getAllURLs = async () => {
  try {
    Log("frontend", "info", "api", "Fetching all URLs")
    console.log("API Request: GET", `${API_BASE_URL}/shorturls`)

    const response = await fetch(`${API_BASE_URL}/shorturls`)
    const result = await handleResponse(response)

    Log("frontend", "info", "api", `Successfully fetched ${result.data.length} URLs`)
    return result.data
  } catch (error) {
    Log("frontend", "error", "api", `Failed to fetch URLs: ${error.message}`)
    throw error
  }
}

export const redirectToURL = async (shortcode) => {
  try {
    Log("frontend", "info", "api", `Redirecting to: ${shortcode}`)
    console.log("API Request: GET", `${API_BASE_URL}/${shortcode}`)

    const response = await fetch(`${API_BASE_URL}/${shortcode}`, {
      method: "GET",
      redirect: "follow",
    })

    if (response.redirected) {
      Log("frontend", "info", "api", `Successfully redirected: ${shortcode}`)
      window.location.href = response.url
    } else {
      const result = await handleResponse(response)
      return result
    }
  } catch (error) {
    Log("frontend", "error", "api", `Failed to redirect ${shortcode}: ${error.message}`)
    throw error
  }
}

export const getSingleURLStats = async (shortcode) => {
  try {
    Log("frontend", "debug", "api", `Fetching single stats for: ${shortcode}`)
    console.log("API Request: GET", `${API_BASE_URL}/shorturls/${shortcode}/stats`)

    const response = await fetch(`${API_BASE_URL}/shorturls/${shortcode}/stats`)
    const result = await handleResponse(response)

    Log("frontend", "info", "api", `Successfully fetched single stats for: ${shortcode}`)
    return result.data
  } catch (error) {
    Log("frontend", "error", "api", `Failed to fetch single stats for ${shortcode}: ${error.message}`)
    throw error
  }
}
