/** @format */

'use client';

import { useDeferredValue, useMemo } from 'react';
import { marked } from 'marked';

import Card from '@/_components/Card';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownPreview({
  title,
  content,
}: Readonly<{
  title?: string;
  content?: string;
}>) {
  const deferredContent = useDeferredValue(content ?? '');
  const previewHtml = useMemo(function buildPreviewHtml() {
    return marked.parse(deferredContent) as string;
  }, [deferredContent]);

  return (
    <Card padding={24} className='gap--16'>
      <Title size='small'>Preview</Title>
      {title?.trim() ? <Title size='medium'>{title.trim()}</Title> : null}
      {deferredContent.trim() ? (
        <article
          className='display--grid gap--8'
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <Text size='small' color='gray'>
          Markdown preview will appear here as soon as you start typing.
        </Text>
      )}
    </Card>
  );
}
