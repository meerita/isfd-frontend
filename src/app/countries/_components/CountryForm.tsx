/** @format */

'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import Select from '@/_components/forms/Select';
import TextInput from '@/_components/forms/TextInput';
import { createCountry } from '@/_actions/country/createCountry';
import { updateCountry } from '@/_actions/country/updateCountry';
import CONTINENTS from '@/_constants/continents';
import type { Country, CountryActionState } from '@/_types/country';
import Grid from '@/_components/layout/Grid';
import Section from '@/_components/layout/Section';
import Title from '@/_components/typography/Title';
import Text from '@/_components/typography/Text';
import List from '@/_components/navigation/List';
import ListItemWithAction from '@/_components/navigation/ListItemWithAction';
import ButtonGroup from '@/_components/navigation/ButtonGroup';
import NAVIGATION from '@/_constants/navigation';
import CheckBoxInput from '@/_components/forms/CheckBoxInput';

const INITIAL_ACTION_STATE: CountryActionState = { status: 'idle' };

type CountryFormValues = Readonly<{
  name: string;
  countryCode: string;
  continent: Country['continent'] | '';
  latitude: string;
  longitude: string;
}>;

type CountryFormProps = Readonly<{
  country?: Country | null;
  provinces?: ReadonlyArray<string>;
  edit?: boolean;
}>;

const toStringValue = (value?: number): string =>
  typeof value === 'number' ? value.toString() : '';

const buildInitialValues = (country?: Country | null): CountryFormValues => ({
  name: country?.name ?? '',
  countryCode: country?.countryCode ?? '',
  continent: country?.continent ?? '',
  latitude: toStringValue(country?.coordinates?.lat),
  longitude: toStringValue(country?.coordinates?.lng),
});

const sortProvinces = (values: ReadonlyArray<string>): string[] =>
  [...values]
    .map(value => value.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

export default function CountryForm({
  country,
  provinces: providedProvinces,
  edit = false,
}: CountryFormProps) {
  const initialValues = buildInitialValues(country);
  const initialProvinces = useMemo(
    () => providedProvinces ?? country?.provinces ?? [],
    [country?.provinces, providedProvinces],
  );
  const [provinces, setProvinces] = useState<string[]>(() =>
    sortProvinces(initialProvinces),
  );
  const [provinceInput, setProvinceInput] = useState('');
  const [actionState, updateAction, pending] = useActionState<
    CountryActionState,
    FormData
  >(updateCountry, INITIAL_ACTION_STATE);
  const formAction = edit ? updateAction : createCountry;
  const submitLabel = edit ? 'Update country' : 'Create country';
  const isPending = edit ? pending : false;

  useEffect(() => {
    if (!edit) {
      return;
    }

    if (actionState.status === 'error' && actionState.error) {
      toast.error(actionState.error.error);
    }
  }, [actionState.error, actionState.status, edit]);

  const handleRemoveProvince = useCallback(
    (provinceToRemove: string) => {
      setProvinces(prev =>
        prev.filter(province => province !== provinceToRemove),
      );
    },
    [setProvinces],
  );

  const handleAddProvince = useCallback(() => {
    const trimmed = provinceInput.trim();
    if (!trimmed) {
      return;
    }

    const exists = provinces.some(
      province => province.toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      setProvinceInput('');
      return;
    }

    setProvinces(prev => sortProvinces([...prev, trimmed]));
    setProvinceInput('');
  }, [provinceInput, provinces, setProvinces]);

  const isAddDisabled = provinceInput.trim().length === 0;
  const hasProvinces = provinces.length > 0;

  return (
    <Form action={formAction}>
      {edit && country ? (
        <input type='hidden' name='countryId' value={country.id} />
      ) : null}

      {provinces.map((province, index) => (
        <input
          key={`${province}-${index}`}
          type='hidden'
          name='provinces'
          value={province}
        />
      ))}

      <Grid columns={2} gap={32}>
        <Section>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Country name'
              name='name'
              placeholder='Enter country name'
              defaultValue={initialValues.name}
              required
            />
            <Grid gap={8} columns={4}>
              <Select
                label='Continent'
                name='continent'
                defaultValue={initialValues.continent}
                placeholder='Select continent'
                className='grid-column--3'
                required
              >
                {CONTINENTS.map(continent => (
                  <option key={continent.value} value={continent.value}>
                    {continent.label}
                  </option>
                ))}
              </Select>
              <TextInput
                label='Country code'
                name='countryCode'
                placeholder='ISO code (e.g. US)'
                defaultValue={initialValues.countryCode}
                className='grid-column--1'
                maxLength={3}
                required
              />
            </Grid>
          </Grid>
          <Grid gap={8} columns={2}>
            <TextInput
              label='Latitude'
              name='latitude'
              placeholder='0.0000'
              defaultValue={initialValues.latitude}
              type='number'
              step='0.0001'
            />

            <TextInput
              label='Longitude'
              name='longitude'
              placeholder='0.0000'
              defaultValue={initialValues.longitude}
              type='number'
              step='0.0001'
            />
            <CheckBoxInput
              name='active'
              label='Active'
              defaultChecked={country?.active ?? true}
              value='true'
              disabled={isPending}
            />
          </Grid>
          <ButtonGroup gap={4}>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Updating country...' : submitLabel}
            </Button>
            <Button
              href={NAVIGATION.COUNTRIES}
              disabled={isPending}
              variant='borderless'
            >
              Cancel
            </Button>
          </ButtonGroup>
        </Section>
        <Section>
          <Title size='small'>Provinces</Title>
          <Grid display='flex' gap={8} columns={2}>
            <TextInput
              placeholder='Province name'
              value={provinceInput}
              onChange={event => setProvinceInput(event.target.value)}
              className='flex-grow--1'
            />
            <Button
              type='button'
              onClick={handleAddProvince}
              disabled={isAddDisabled || isPending}
            >
              Add province
            </Button>
          </Grid>
          {hasProvinces ? (
            <List columns={3} gap={16}>
              {provinces.map(province => (
                <ListItemWithAction
                  key={province}
                  line
                  label={province}
                  action={() => handleRemoveProvince(province)}
                  actionTitle={`Remove ${province}`}
                />
              ))}
            </List>
          ) : (
            <Text size='small' color='gray'>
              No provinces yet. Use the field above to add one.
            </Text>
          )}
        </Section>
      </Grid>
    </Form>
  );
}
