import { useContext, createContext } from "react"

type NavigationPage = "home" | "request" | "fund" | "about" | "projects"

interface NavigationContextType {
  navigate: (page: NavigationPage) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ 
  children, 
  onNavigate 
}: { 
  children: React.ReactNode
  onNavigate: (page: NavigationPage) => void
}) {
  const navigate = (page: NavigationPage) => {
    onNavigate(page)
  }

  return (
    <NavigationContext.Provider value={{ navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigate() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigate must be used within a NavigationProvider")
  }
  return context
}