/** @format */

'use client';

import { useState } from 'react';

import { LEGAL_LANGUAGES } from '@/_constants/legal';
import Button from '@/_components/forms/Button';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';
import Title from '@/_components/typography/Title';
import type { LegalDocument } from '@/_types/legal';

import MarkdownPreview from './MarkdownPreview';

export default function LegalPublicPreview({
  document,
}: Readonly<{
  document: LegalDocument | null;
}>) {
  const [activeLanguage, setActiveLanguage] = useState(
    document?.translations[0]?.language ?? 'EN',
  );
  const activeTranslation =
    document?.translations.find(function findTranslation(translation) {
      return translation.language === activeLanguage;
    }) ??
    document?.translations.find(function fallbackToEnglish(translation) {
      return translation.language === 'EN';
    }) ??
    document?.translations[0] ??
    null;

  return (
    <Grid gap={16}>
      <Grid gap={8}>
        <Title size='small'>Latest public preview</Title>
        <Text size='small' color='gray'>
          This is the latest published document returned by the public endpoint.
        </Text>
      </Grid>
      <Grid display='flex' gap={8} alignItems='center'>
        {LEGAL_LANGUAGES.map(function renderLanguage(language) {
          const isActive = activeLanguage === language.value;
          const isAvailable = document?.translations.some(function hasTranslation(
            translation,
          ) {
            return translation.language === language.value;
          });

          return (
            <Button
              key={language.value}
              type='button'
              variant={isActive ? 'solid' : 'borderless'}
              disabled={!isAvailable}
              onClick={function handleSelectLanguage() {
                setActiveLanguage(language.value);
              }}
            >
              {language.label}
            </Button>
          );
        })}
      </Grid>
      {activeTranslation && document ? (
        <MarkdownPreview
          title={document.title}
          content={activeTranslation.content}
        />
      ) : (
        <Text size='small' color='gray'>
          No published document is available for this language yet.
        </Text>
      )}
    </Grid>
  );
}
