import * as React from 'react'

import { AnimatedNavFramer } from '@/components/ui/navigation-menu'
import { HeroSection } from '@/components/hero/HeroSection'
import { SkillsSlider } from '@/components/skills/SkillsSlider'
import { ProjectsSection } from '@/components/projects/ProjectsSection'
import { ChatWidget, type ChatMode } from '@/components/chat/ChatWidget'

export default function HomePage() {
  const [chatMode, setChatMode] = React.useState<ChatMode>('hidden')

  return (
    <>
      <AnimatedNavFramer />
      <HeroSection onOpenChat={() => setChatMode('open')} />
      <SkillsSlider />
      <ProjectsSection />
      <ChatWidget
        mode={chatMode}
        onCollapse={() => setChatMode('compact')}
        onExpand={() => setChatMode('open')}
        onClose={() => setChatMode('hidden')}
      />
    </>
  )
}
