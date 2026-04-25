/** @format */

import Link from 'next/link';

import { getFeatureFlags } from '@/_actions/flags/getFeatureFlags';
import Button from '@/_components/forms/Button';
import Main from '@/_components/layout/Main';
import SectionHeader from '@/_components/layout/SectionHeader';
import Cell from '@/_components/tables/Cell';
import Row from '@/_components/tables/Row';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import Thead from '@/_components/tables/Thead';
import NAVIGATION from '@/_constants/navigation';
import SECTIONS from '@/_constants/sections';
import type { FeatureFlag } from '@/_types/featureFlag';

const EMPTY_VALUE = '--';

function formatDescription(description?: string): string {
  if (!description || description.trim().length === 0) {
    return EMPTY_VALUE;
  }

  return description;
}

export default async function FlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <>
      <SectionHeader title={SECTIONS.FLAGS} icon='flag'>
        <Link href='/flags/create'>
          <Button icon='plus' type='button'>
            Create Flag
          </Button>
        </Link>
      </SectionHeader>
      <Main>
        <Table>
          <Thead>
            <Row>
              <Cell header>Key</Cell>
              <Cell header>Status</Cell>
              <Cell header align='center'>
                Default
              </Cell>
              <Cell header>Description</Cell>
            </Row>
          </Thead>
          <Tbody>
            {flags.length === 0 ? (
              <Row>
                <Cell>No feature flags available yet.</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
                <Cell align='center'>{EMPTY_VALUE}</Cell>
                <Cell>{EMPTY_VALUE}</Cell>
              </Row>
            ) : (
              flags.map((flag: FeatureFlag) => (
                <Row key={flag.id} href={NAVIGATION.FLAGS + `/${flag.id}`}>
                  <Cell>{flag.key}</Cell>
                  <Cell>{flag.status}</Cell>
                  <Cell align='center'>
                    {flag.defaultEnabled ? 'Yes' : 'No'}
                  </Cell>
                  <Cell>{formatDescription(flag.description)}</Cell>
                </Row>
              ))
            )}
          </Tbody>
        </Table>
      </Main>
    </>
  );
}
