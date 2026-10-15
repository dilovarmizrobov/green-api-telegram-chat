import { avatarHue, getInitials } from '../../utils/format'
import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
  seed: string
  size?: number
}

export function Avatar({ name, seed, size = 48 }: AvatarProps) {
  const hue = avatarHue(seed)
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 80% 65%), hsl(${(hue + 35) % 360} 75% 52%))`,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}
