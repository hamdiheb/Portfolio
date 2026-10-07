import type { IconType } from 'react-icons'
import {
  SiJavascript,
  SiPostgresql,
  SiSupabase,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiDocker,
  SiGit,
  SiGithub,
  SiClaude,
  SiLangchain,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiVite,
} from 'react-icons/si'
import { TbBrandAws, TbBrandOpenai } from 'react-icons/tb'

interface Skill {
  name: string
  Icon: IconType
  color?: string
}

const SKILLS: Skill[] = [
  { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  { name: 'Express.js', Icon: SiExpress },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1' },
  { name: 'Supabase', Icon: SiSupabase, color: '#3FCF8E' },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
  { name: 'AWS', Icon: TbBrandAws },
  { name: 'Git', Icon: SiGit, color: '#F05032' },
  { name: 'GitHub', Icon: SiGithub },
  { name: 'Vite', Icon: SiVite, color: '#646CFF' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#38BDF8' },
  { name: 'Framer Motion', Icon: SiFramer },
  { name: 'Claude', Icon: SiClaude, color: '#D97757' },
  { name: 'OpenAI', Icon: TbBrandOpenai },
  { name: 'LangChain', Icon: SiLangchain, color: '#1C3C3C' },
]

export function SkillsSlider() {
  const track = [...SKILLS, ...SKILLS]

  return (
    <section
      className="overflow-hidden py-12"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
        {track.map((skill, i) => (
          <div
            key={`${skill.name}-${i}`}
            className="flex shrink-0 items-center gap-2 text-foreground"
          >
            <skill.Icon
              className="h-7 w-7"
              style={skill.color ? { color: skill.color } : undefined}
            />
            <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
