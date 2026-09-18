import type { ReactNode } from 'react';
import type { UserRole } from '../types';
import { useApp } from '../hooks/useApp';
import { EmptyState } from './ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

/**
 * Renders children only when someone is signed in, optionally in a given role.
 * Keeps role checks out of the dashboards themselves.
 */
export function ProtectedRoute({
  role,
  children,
}: {
  role?: UserRole;
  children: ReactNode;
}) {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  if (role && currentUser.role !== role) {
    return (
      <EmptyState
        icon={<ShieldAlert size={48} />}
        title="This area is for a different role"
        description={`Your account is signed in as a ${currentUser.role}. Sign out and sign back in with the right account to see this.`}
      />
    );
  }

  return <>{children}</>;
}
