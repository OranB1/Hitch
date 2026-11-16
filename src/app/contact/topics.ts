// Who the message is from. Shared by the page (reads ?topic=), the form (chips) and the action
// (prefixes the saved message), so the contact_messages table and the email stay unchanged.
export const CONTACT_TOPICS = [
  {
    value: "qi",
    label: "I run QI or audit for a team or trust",
    placeholder: "Which trust or department are you in, and what kinds of projects tend to stall?",
    help: "We'll reply to set up a call.",
  },
  {
    value: "me",
    label: "I'm a student or doctor",
    placeholder: "What are you looking for, or what could be better?",
    help: "Feedback on the demo or the board is very welcome.",
  },
  {
    value: "other",
    label: "Something else",
    placeholder: "How can we help?",
    help: "",
  },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export function isContactTopic(value: unknown): value is ContactTopic {
  return CONTACT_TOPICS.some((t) => t.value === value);
}
