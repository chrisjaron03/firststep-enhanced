"use client"

import { useEffect, useRef } from "react"
import { api } from "@/lib/api"

export function useAnalytics() {
  const lastPage = useRef("")

  useEffect(() => {
    const trackPageview = () => {
      const path = window.location.pathname
      if (path === lastPage.current) return
      lastPage.current = path
      api.trackEvent({ type: "pageview" })
    }

    trackPageview()

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const linkOrButton = target.closest("a, button, [role='button']") as HTMLElement | null
      if (!linkOrButton) return

      api.trackEvent({
        type: "click",
        element_id: linkOrButton.id || undefined,
        element_class: linkOrButton.className || undefined,
        element_text: linkOrButton.textContent?.trim().substring(0, 100) || undefined,
        element_href: linkOrButton.getAttribute("href") || undefined,
      })
    }

    let scrollTimeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        )
        if (scrollDepth > 0 && scrollDepth % 25 === 0) {
          api.trackEvent({ type: "scroll", scroll_depth: scrollDepth })
        }
      }, 300)
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])
}
