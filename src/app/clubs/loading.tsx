/** @format */

'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const CLUBS_LOADING_TOAST_ID = 'clubs-page-loading';

export default function ClubsLoading() {
  useEffect(() => {
    toast.loading('Loading...', { id: CLUBS_LOADING_TOAST_ID });

    return () => {
      toast.dismiss(CLUBS_LOADING_TOAST_ID);
    };
  }, []);

  return null;
}
