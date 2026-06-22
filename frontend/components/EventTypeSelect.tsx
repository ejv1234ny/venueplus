'use client';

import { EVENT_TYPE_GROUPS } from '@/lib/eventTypes';

/** Single-select dropdown of event types, grouped with <optgroup>.
 *  Used by the booking "occasion" field and the venue search filter. */
export default function EventTypeSelect({
  value,
  onChange,
  id,
  placeholder = 'Any occasion',
  includeBlank = true,
  className = 'input-field',
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  includeBlank?: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {includeBlank && <option value="">{placeholder}</option>}
      {EVENT_TYPE_GROUPS.map((g) => (
        <optgroup key={g.group} label={g.group}>
          {g.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
