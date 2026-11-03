/** One role on the founder's career line. */
export interface ProfileCareer {
  /** Stable id for the logo lookup — the name itself is localised. */
  key: string;
  company: string;
  role: string;
  period: string;
}

/** A labelled group of tools. */
export interface ProfileSkillGroup {
  label: string;
  items: string[];
}

/** An outbound contact or profile link. */
export interface ProfileLink {
  label: string;
  value: string;
  href: string;
}
