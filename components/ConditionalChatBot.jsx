'use client'

import { usePathname } from 'next/navigation'
import FloatingChatBot from '@/components/ChatBot/MessengerNon-ai'

export default function ConditionalChatbot() {
    const pathname = usePathname()

    const excludedPaths = ['/admin', '/login', '/magazine', '/Flash-report-pdf', '/flash-reports', '/insights']
    const shouldShowChatBot = !excludedPaths.some(path => pathname.startsWith(path))

    return shouldShowChatBot ? <FloatingChatBot /> : null
}
