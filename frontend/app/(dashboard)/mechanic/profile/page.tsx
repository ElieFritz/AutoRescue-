'use client';

import { useEffect } from 'react';

export default function MechanicProfilePage() {
  useEffect(() => {
    window.location.href = '/profile';
  }, []);

  return null;
}
