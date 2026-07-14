export interface PageType {
  id: string;
  label: string;
}

/** Page types the client can request for their website. */
export const PAGE_TYPES: PageType[] = [
  { id: 'homepage', label: 'דף הבית' },
  { id: 'about', label: 'אודותינו' },
  { id: 'contact', label: 'צור קשר' },
  { id: 'faq', label: 'שאלות נפוצות' },
  { id: 'privacy', label: 'מדיניות פרטיות' },
  { id: 'landing', label: 'דף נחיתה' },
];
