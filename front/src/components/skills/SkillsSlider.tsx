import type { IconType } from 'react-icons'
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiVite,
  SiTailwindcss,
  SiGsap,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiSupabase,
  SiDocker,
  SiGit,
  SiGithub,
  SiVercel,
  SiNetlify,
  SiRender,
  SiClaude,
  SiOpenrouter,
  SiLangchain,
} from 'react-icons/si'
import { TbBrandOpenai } from 'react-icons/tb'

interface Skill {
  name: string
  Icon: IconType
  /** Brand colour; omitted for black/white marks so they follow the theme. */
  color?: string
}

// The CV's stack, plus TypeScript, Framer Motion and LangChain, which this site
// and its CV chatbot are built with.
const SKILLS: Skill[] = [
  { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#5FA04E' },
  { name: 'Express', Icon: SiExpress },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1' },
  { name: 'Supabase', Icon: SiSupabase, color: '#3FCF8E' },
  { name: 'Vite', Icon: SiVite, color: '#646CFF' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#38BDF8' },
  { name: 'GSAP', Icon: SiGsap, color: '#0AE448' },
  { name: 'Framer Motion', Icon: SiFramer },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
  { name: 'Git', Icon: SiGit, color: '#F05032' },
  { name: 'GitHub', Icon: SiGithub },
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Netlify', Icon: SiNetlify, color: '#00C7B7' },
  { name: 'Render', Icon: SiRender },
  { name: 'Claude Code', Icon: SiClaude, color: '#D97757' },
  { name: 'OpenAI Codex', Icon: TbBrandOpenai },
  { name: 'OpenRouter', Icon: SiOpenrouter },
  { name: 'LangChain', Icon: SiLangchain },
]

function SkillList({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className={
        'm-0 flex shrink-0 list-none items-center gap-12 p-0 pr-12 ' +
        // Reduced motion: no marquee, so the duplicate goes and the list wraps instead.
        (hidden ? 'motion-reduce:hidden' : 'motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-10 motion-reduce:gap-y-6 motion-reduce:pr-0')
      }
    >
      {SKILLS.map((skill) => (
        <li key={skill.name} className="flex shrink-0 items-center gap-2 text-foreground">
          <skill.Icon
            aria-hidden="true"
            className="h-7 w-7"
            style={skill.color ? { color: skill.color } : undefined}
          />
          <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
            {skill.name}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function SkillsSlider() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="overflow-hidden py-12 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] motion-reduce:px-4 motion-reduce:[mask-image:none]"
    >
      <h2 id="skills-heading" className="sr-only">
        Skills and tech stack
      </h2>
      {/* Two identical lists side by side; the track slides by half its width and loops. */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none">
        <SkillList />
        <SkillList hidden />
      </div>
    </section>
  )
}
