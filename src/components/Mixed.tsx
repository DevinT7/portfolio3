import { Fragment } from "react";

/** Renders "plain *serif* plain": text wrapped in asterisks becomes the italic serif. */
export function Mixed({ text, serifClassName = "" }: { text: string; serifClassName?: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className={`serif ${serifClassName}`}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
