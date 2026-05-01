/** @format */

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { updateCompetitionEditionCode } from '@/_actions/competitionEdition/updateCompetitionEditionCode';
import Button from '@/_components/forms/Button';
import Form from '@/_components/forms/Form';
import TextInput from '@/_components/forms/TextInput';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Title from '@/_components/typography/Title';
import { resolveCompetitionAdminErrorMessage } from '@/_constants/competitionAdminErrorMessages';
import type { CompetitionEditionActionState } from '@/_types/competitionEdition';

const INITIAL_STATE: CompetitionEditionActionState = { status: 'idle' };

type CompetitionEditionCodeFormProps = Readonly<{
  competitionEditionId: string;
  currentCode?: string | null;
}>;

export default function CompetitionEditionCodeForm({
  competitionEditionId,
  currentCode,
}: CompetitionEditionCodeFormProps): React.JSX.Element {
  const router = useRouter();
  const [state, action, isPending] = useActionState<
    CompetitionEditionActionState,
    FormData
  >(updateCompetitionEditionCode, INITIAL_STATE);

  useEffect(() => {
    if (state.status === 'idle') return;

    if (state.status === 'error') {
      toast.error(resolveCompetitionAdminErrorMessage(state.error));
      return;
    }

    toast.success('Competition edition code updated successfully.');
    router.refresh();
  }, [router, state.error, state.status]);

  return (
    <Form action={action}>
      <input type='hidden' name='competitionEditionId' value={competitionEditionId} />
      <Card>
        <Grid gap={16}>
          <Title size='small'>Update code</Title>
          <TextInput
            label='Code'
            name='code'
            placeholder='EDITION_CODE'
            defaultValue={currentCode ?? ''}
            required
            disabled={isPending}
          />
          <div>
            <Button type='submit' disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Updating code...' : 'Update code'}
            </Button>
          </div>
        </Grid>
      </Card>
    </Form>
  );
}
