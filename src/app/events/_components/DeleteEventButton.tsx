/** @format */

'use client';

// File: src/app/events/_components/DeleteEventButton.tsx
// Purpose: Client button that confirms and deletes an event
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteEvent } from '@/_actions/event/deleteEvent';
import Button from '@/_components/forms/Button';
import NAVIGATION from '@/_constants/navigation';

type DeleteEventButtonProps = Readonly<{
  eventId: string;
  eventTitle: string;
}>;

export default function DeleteEventButton({
  eventId,
  eventTitle,
}: DeleteEventButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigateBack() {
    if (globalThis?.window?.history.length > 1) {
      router.back();
      return;
    }

    router.push(NAVIGATION.EVENTS);
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed =
      globalThis?.window?.confirm(
        `Are you sure you want to delete ${eventTitle}? This action cannot be undone.`,
      ) ?? false;

    if (!confirmed) {
      return;
    }

    startTransition(function performDeleteTransition() {
      void (async function performDelete() {
        const result = await deleteEvent(eventId);

        if (result.success) {
          toast.success('Event deleted successfully.');
          navigateBack();
          return;
        }

        toast.error(result.error ?? 'We could not delete this event.');
      })();
    });
  }

  return (
    <Button
      icon='remove'
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? 'Deleting…' : 'Delete Event'}
    </Button>
  );
}
