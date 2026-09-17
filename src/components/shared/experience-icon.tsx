export function ExperienceIcon({ tone }: Readonly<{ tone: string }>) {
  return (
    <span className={`experience-icon tone-${tone}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
