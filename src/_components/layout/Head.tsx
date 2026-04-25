/** @format */

import GLOBALS from '@/_constants/globals';
export default function Head({
  title = GLOBALS.metadata.title,
}: Readonly<{
  title: string;
}>) {
  return <title>asdasd - {title}</title>;
}
