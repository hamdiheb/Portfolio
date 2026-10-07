import { AnimatedNavFramer } from '@/components/ui/navigation-menu'
import { HeroSection } from '@/components/hero/HeroSection'
import { SkillsSlider } from '@/components/skills/SkillsSlider'
import { GithubActivity } from '@/components/github/GithubActivity'
import { ProjectsSection } from '@/components/projects/ProjectsSection'
import { ContactSection } from '@/components/contact/ContactSection'
import { Footer } from '@/components/footer/Footer'
import { CvChatProvider } from '@/components/chat/CvChatProvider'

export default function HomePage() {
  return (
    <CvChatProvider>
      <AnimatedNavFramer />
      <main>
        <HeroSection />
        <SkillsSlider />
        <GithubActivity />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </CvChatProvider>
  )
}
