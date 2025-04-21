import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Simple error boundary to catch and display errors
const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error("Root element not found")
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error("Error rendering app:", error)
    // Display error on page for debugging
    rootElement.innerHTML = `
      <div style="color: red; margin: 20px; font-family: sans-serif;">
        <h1>Error rendering application</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <p>Check the console for more details.</p>
      </div>
    `
  }
}
