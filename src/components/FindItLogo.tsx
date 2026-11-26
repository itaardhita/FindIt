type Props = {
  size?: number
}

export default function FindItLogo({ size = 24 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 29S5 21 5 12.5C5 6.7 9.5 3 16 3s11 3.7 11 9.5C27 21 16 29 16 29Z" />
      <circle cx={15} cy={12.5} r={4.5} />
      <path d="m18.2 15.7 3.8 3.8" />
    </svg>
  )
}
