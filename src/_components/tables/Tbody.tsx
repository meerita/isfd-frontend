/** @format */

export default function Tbody(
  props: Readonly<{ children: React.ReactNode; className?: string }>
) {
  return <tbody className={props.className}>{props.children}</tbody>;
}
