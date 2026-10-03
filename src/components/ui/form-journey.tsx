"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "./button";
import { Stepper } from "./stepper";
import styles from "./ui.module.css";

export function FormJourney({ steps, onSubmit, onCancel, busy = false, disabled = false, submitLabel = "Simpan", feedback }: Readonly<{
  steps: readonly { title: string; content: ReactNode }[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void; busy?: boolean; disabled?: boolean; submitLabel?: string; feedback?: ReactNode;
}>) {
  const [current, setCurrent] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (current > 0) heading.current?.focus(); }, [current]);
  const last = current === steps.length - 1;
  return <form onSubmit={event => { if (!last) { event.preventDefault(); setCurrent(value => value + 1); } else onSubmit(event); }}>
    <Stepper steps={steps.map(step => step.title)} current={current} />
    <h3 ref={heading} tabIndex={-1} className={styles.journeyHeading}>{steps[current].title}</h3>
    {steps.map((step, index) => <fieldset className={styles.journeyBody} key={step.title} hidden={index !== current} disabled={index !== current || busy}>{step.content}</fieldset>)}
    {feedback}
    <div className={styles.journeyActions}>
      <Button type="button" variant="ghost" disabled={busy} onClick={current ? () => setCurrent(value => value - 1) : onCancel}>{current ? "Kembali" : "Batal"}</Button>
      <Button type="submit" disabled={busy || (last && disabled)} loading={busy}>{last ? submitLabel : "Lanjut"}</Button>
    </div>
  </form>;
}
