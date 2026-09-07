export interface PolicyIndexItem {
  id: string;
  title: string;
}

export interface PolicyIndexProps {
  /** Accessible name for the index, and its printed heading. */
  label: string;
  items: PolicyIndexItem[];
}
