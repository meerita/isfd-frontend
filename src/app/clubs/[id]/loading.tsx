/** @format */

'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const CLUB_DETAIL_LOADING_TOAST_ID = 'club-detail-page-loading';

export default function ClubDetailLoading() {
  useEffect(() => {
    toast.loading('Loading...', { id: CLUB_DETAIL_LOADING_TOAST_ID });

    return () => {
      toast.dismiss(CLUB_DETAIL_LOADING_TOAST_ID);
    };
  }, []);

  return null;
}
