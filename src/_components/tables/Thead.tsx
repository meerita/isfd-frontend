/** @format */

export default function Thead(
  props: Readonly<{ children: React.ReactNode; className?: string }>
) {
  return <thead className={props.className}>{props.children}</thead>;
}
