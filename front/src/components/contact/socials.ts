import type { IconType } from 'react-icons'
import { FaLinkedinIn } from 'react-icons/fa6'
import { SiGithub } from 'react-icons/si'
import { Mail } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

export const EMAIL = 'ihebhamdi1@gmail.com'

export interface SocialLink {
  label: string
  /** Shown next to the label, e.g. the handle or address. */
  value: string
  href: string
  icon: IconType | ComponentType<SVGProps<SVGSVGElement>>
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, icon: Mail },
  { label: 'GitHub', value: 'hamdiheb', href: 'https://github.com/hamdiheb', icon: SiGithub },
  {
    label: 'LinkedIn',
    value: 'in/hamdiheb',
    href: 'https://www.linkedin.com/in/hamdiheb',
    icon: FaLinkedinIn,
  },
]
