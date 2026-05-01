/** @format */
/**
 * @file src/app/persons/_components/PersonInformationTab.tsx
 * @description Renders the localized information tab placeholder for person details.
 * @layer app
 * @created Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

'use client';
import Card from '@/_components/Card';
import Dot from '@/_components/Dot';
import Button from '@/_components/forms/Button';
import LastUpdated from '@/_components/forms/LastUpdated';
import DataRowSection from '@/_components/layout/DataRowSection';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import SectionHeader from '@/_components/layout/SectionHeader';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import DataRow from '@/_components/tables/DataRow';
import Table from '@/_components/tables/Table';
import Tbody from '@/_components/tables/Tbody';
import { useI18n } from '@/_i18n/I18nProvider';
import type { Person } from '@/_types/person';

export default function PersonInformationTab({
  person,
}: Readonly<{
  person: Readonly<Person>;
}>): React.JSX.Element {
  const { dictionary } = useI18n();

  return (
    <Card>
      <SectionHeader title={'Ficha Ténica de Lionel Messi'}>
        <ButtonGroup>
          <Button>{dictionary.common.edit}</Button>
        </ButtonGroup>
      </SectionHeader>
      {/* <PersonForm person={person} /> */}
      <Grid gap={32} columns={2}>
        <Section gap={32}>
          <DataRowSection title='Identidad en la comunidad'>
            <Table>
              <Tbody>
                <DataRow
                  label={'Nombre Completo'}
                  value={'Lionel Andrés Messi Cuccittini'}
                />
                <DataRow label='Nombre de Pila' value={'Lionel Messi'} />
                <DataRow label='Apodo' value={'La Pulga'} />
              </Tbody>
            </Table>
          </DataRowSection>
          <DataRowSection title='Identidad Legal'>
            <Table>
              <Tbody>
                <DataRow label={'Primer Nombre'} value={'Lionel'} />
                <DataRow label='Segundo Nombre' value={'Andrés'} />
                <DataRow label='Apellido' value={'Messi'} />
                <DataRow label='Apellido de Casado' value={'Cuccittini'} />
                <DataRow label='Fecha de Nacimiento' value={'24/06/1987'} />
                <DataRow label='Vivo' value={<Dot inline active={true} />} />
                <DataRow label='Fecha de Fallecimiento' value={'24/06/1987'} />
              </Tbody>
            </Table>
          </DataRowSection>
          <DataRowSection title='Localización'>
            <Table>
              <Tbody>
                <DataRow
                  label={'Lugar de Nacimiento'}
                  value={'Rosario, Santa Fe, Argentina'}
                />
                <DataRow
                  label={'Residencia Actual'}
                  value={'Miami, Florida, Estados Unidos'}
                />
              </Tbody>
            </Table>
          </DataRowSection>
        </Section>
        <Section gap={32}>
          <DataRowSection title='Detalles Físicos'>
            <Table>
              <Tbody>
                <DataRow label={'Pie dominante'} value={'Izquierdo'} />
                <DataRow label={'Altura'} value={'1.70 m'} />
                <DataRow label='Peso' value={'72 kg'} />
                <DataRow label='Género' value={'Masculino'} />
                <DataRow label='Color de Ojos' value={'Marrón'} />
                <DataRow label='Color de Cabello' value={'Castaño'} />
                <DataRow label='Color de Piel' value={'Claro'} />
              </Tbody>
            </Table>
          </DataRowSection>
          <DataRowSection title='Información Profesional'>
            <Table>
              <Tbody>
                <DataRow label={'Profesión'} value={'Futbolista'} />
                <DataRow label={'Debut como Jugador'} value={'24/06/2004'} />
                <DataRow label={'Retiro como Jugador'} value={'24/06/2024'} />
              </Tbody>
            </Table>
          </DataRowSection>
        </Section>
      </Grid>
      <LastUpdated date={new Date()} />
    </Card>
  );
}
