'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function MotoristProfilePage() {
  useEffect(() => {
    // Redirect to the common profile page
    window.location.href = '/profile';
  }, []);

  return null;
}
