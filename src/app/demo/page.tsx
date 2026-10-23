import type { Metadata } from "next";
import DemoRoot from "./DemoRoot";

export const metadata: Metadata = {
  title: "Hitch demo: see how the marketplace works",
  description:
    "See exactly what it looks like to post an opportunity as a doctor, or find and apply to one as a student. No account needed.",
};

export default function DemoPage() {
  return <DemoRoot />;
}
