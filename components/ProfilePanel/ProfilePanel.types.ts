/** One role on the founder's career line. */
export interface ProfileCareer {
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
