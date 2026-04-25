/** @format */

import Main from '@/_components/layout/Main';
import Section from '@/_components/layout/Section';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import Title from '@/_components/typography/Title';
import { LEGAL_LANGUAGES } from '@/_constants/legal';
import NAVIGATION from '@/_constants/navigation';
import type { LegalDocument } from '@/_types/legal';

import LegalStatusBadge from './LegalStatusBadge';

function formatDateTime(value?: string): string {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString();
}

function getLanguageLabel(language: string): string {
  return (
    LEGAL_LANGUAGES.find(function findLanguage(option) {
      return option.value === language;
    })?.label ?? language
  );
}

export default function LegalTranslationList({
  document,
}: Readonly<{
  document: LegalDocument;
}>) {
  const isEditable = document.status === 'DRAFT';

  return (
    <Section>
      <Main>
        <Title size='small'>Languages</Title>

        <Table>
          <Thead>
            <Row>
              <Cell header>Language</Cell>
              <Cell header>Status</Cell>
              <Cell header>Updated</Cell>
            </Row>
          </Thead>
          <Tbody>
            {document.translations.length === 0 ? (
              <Row>
                <Cell>No translations yet.</Cell>
                <Cell>--</Cell>
                <Cell>--</Cell>
              </Row>
            ) : (
              document.translations.map(function renderTranslation(translation) {
                return (
                  <Row
                    key={translation.id}
                    href={
                      isEditable
                        ? NAVIGATION.LEGAL_TRANSLATION_BY_ID(
                            document.id,
                            translation.id,
                          )
                        : undefined
                    }
                  >
                    <Cell>{getLanguageLabel(translation.language)}</Cell>
                    <Cell>
                      <LegalStatusBadge status={translation.status} />
                    </Cell>
                    <Cell>{formatDateTime(translation.updated_at)}</Cell>
                  </Row>
                );
              })
            )}
          </Tbody>
        </Table>
      </Main>
    </Section>
  );
}
