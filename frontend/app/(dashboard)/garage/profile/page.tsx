'use client';

import { useEffect } from 'react';

export default function GarageProfilePage() {
  useEffect(() => {
    window.location.href = '/profile';
  }, []);

  return null;
}
