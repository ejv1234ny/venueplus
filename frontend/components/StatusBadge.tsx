'use client';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-neutral-100 text-neutral-700';

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${style}`}>
      {status}
    </span>
  );
}
