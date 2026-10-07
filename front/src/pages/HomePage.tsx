import { AnimatedNavFramer } from '@/components/ui/navigation-menu'
import { HeroSection } from '@/components/hero/HeroSection'
import { SkillsSlider } from '@/components/skills/SkillsSlider'
import { GithubActivity } from '@/components/github/GithubActivity'
import { ProjectsSection } from '@/components/projects/ProjectsSection'
import { CvChatProvider } from '@/components/chat/CvChatProvider'

export default function HomePage() {
  return (
    <CvChatProvider>
      <AnimatedNavFramer />
      <HeroSection />
      <SkillsSlider />
      <GithubActivity />
      <ProjectsSection />
    </CvChatProvider>
  )
}
