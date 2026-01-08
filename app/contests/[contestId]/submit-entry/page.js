import { notFound } from "next/navigation";
import { getContest } from "@/lib/api";
import SubmitEntryForm from "./SubmitEntryForm";

export async function generateMetadata({ params }) {
  const { contestId } = await params;
  try {
    const contest = await getContest(contestId);
    return {
      title: `Подать заявку — ${contest.name}`,
      description: contest.description,
    };
  } catch {
    return { title: "Подать заявку" };
  }
}

export default async function SubmitEntryPage({ params }) {
  const { contestId } = await params;

  let contest;
  try {
    contest = await getContest(contestId);
  } catch {
    notFound();
  }

  return <SubmitEntryForm contest={contest} />;
}
