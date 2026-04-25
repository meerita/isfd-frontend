/** @format */
'use client';

import { useRouter } from 'next/navigation';

export default function Row({
  children,
  className = '',
  href,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  href?: string;
}>) {
  const router = useRouter();

  // Función para manejar el clic, que navega a la URL especificada
  const handleClick = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => {
    if (href) {
      e.preventDefault();
      router.prefetch(href);
      router.push(href);
    }
  };

  return (
    <tr
      className={`${className}${
        href ? 'cursor--pointer background-color--almost-white:hover' : null
      }`}
      onClick={handleClick}
    >
      {children}
    </tr>
  );
}
