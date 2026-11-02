/** One client review. Names and companies stay private, so only the role is shown. */
export interface TestimonialItem {
  quote: string;
  /** Outcome the client reported, shown as a small pill. */
  metric?: string;
  role: string;
}
