/** @format */

'use client';
import { useTransition } from 'react';
import { toast } from 'sonner';
import ApiError from '@/types/Error';
import { useRouter } from 'next/navigation';
import NAVIGATION from '@/constants/navRoutes';
import deleteUser from '@/actions/user/delete';

interface Props {
  uuid: string;
}

export default function DeleteUserButton({ uuid }: Readonly<Props>) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmed = globalThis.confirm('Are you sure you want to delete this?');
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteUser(uuid);
        router.push(NAVIGATION.USERS);
      } catch (error: unknown) {
        const apiError = error as ApiError;

        if (apiError?.reason) {
          toast.error(apiError.reason, {
            description: apiError.description,
          });
        } else {
          toast.error('Unexpected error deleting user');
        }
      }
    });
  };

  return (
    <button className='btn' onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
