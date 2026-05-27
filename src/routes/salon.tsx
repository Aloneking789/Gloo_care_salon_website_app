import { createFileRoute } from '@tanstack/react-router';
import { SalonLayout } from '@/components/SalonLayout';

export const Route = createFileRoute('/salon')({
  component: SalonLayout,
});
