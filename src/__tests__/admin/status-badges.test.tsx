import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountStatusBadge } from '@/components/admin/account-status-badge';
import { ListingStatusBadge } from '@/components/admin/listing-status-badge';
import { VerificationBadge } from '@/components/admin/verification-badge';

describe('Admin status badges', () => {
  it('renders verification statuses', () => {
    render(<VerificationBadge status="VERIFIED" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();

    render(<VerificationBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders account statuses', () => {
    render(<AccountStatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();

    render(<AccountStatusBadge status="SUSPENDED" />);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('renders listing statuses', () => {
    render(<ListingStatusBadge status="PUBLISHED" />);
    expect(screen.getByText('Published')).toBeInTheDocument();

    render(<ListingStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
