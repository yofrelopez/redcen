import { useEffect } from "react"

export function useScrollLock(lock: boolean) {
    useEffect(() => {
        if (lock) {
            const originalStyle = window.getComputedStyle(document.body).overflow
            document.body.style.overflow = "hidden"
            // Optional: Add padding-right to prevent layout shift if scrollbar disappears
            // const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
            // document.body.style.paddingRight = `${scrollbarWidth}px`

            return () => {
                document.body.style.overflow = originalStyle
                // document.body.style.paddingRight = "0px"
            }
        }
    }, [lock])
}
