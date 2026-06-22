// Display labels for service categories. The backend stores/returns them
// lowercase (e.g. "dj"), and naive CSS `capitalize` renders "Dj"/"DJ" wrong.
// Use serviceCategoryLabel() everywhere a category is shown to the user.
export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  cleaning: 'Cleaning',
  security: 'Security',
  catering: 'Catering',
  bartending: 'Bartending',
  dj: 'DJ',
  photography: 'Photography',
  decoration: 'Decoration',
  equipment: 'Equipment',
  staff: 'Staff',
  other: 'Other',
};

export function serviceCategoryLabel(category?: string): string {
  if (!category) return '';
  return SERVICE_CATEGORY_LABELS[category]
    || category.charAt(0).toUpperCase() + category.slice(1);
}
