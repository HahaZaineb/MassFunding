


import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ProjectProvider } from "./context/project-context.tsx"

// Add error boundary to catch and display errors
const rootElement = document.getElementById("root")

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </React.StrictMode>
  )
}
