import * as React from "react"

// Export breakpoint for use in other files (e.g., Image sizes attribute)
export const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false for SSR (assumes desktop)
  // This prevents layout shift as most users are desktop
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Set initial value immediately
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Use modern API with fallback
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else {
      // Fallback for older browsers
      mql.addListener(onChange)
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else {
        // Fallback for older browsers
        mql.removeListener(onChange)
      }
    }
  }, [])

  return isMobile
}
