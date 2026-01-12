import { notFound } from "next/navigation";
import { getContest } from "@/lib/api";
import SubmitEntryForm from "./SubmitEntryForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const contest = await getContest(id);
    return {
      title: `Подать заявку — ${contest.name}`,
      description: contest.description,
    };
  } catch {
    return { title: "Подать заявку" };
  }
}

export default async function SubmitEntryPage({ params }) {
  const { id } = await params;

  let contest;
  try {
    contest = await getContest(id);
  } catch {
    notFound();
  }

  return <SubmitEntryForm contest={contest} />;
}

