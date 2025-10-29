import Link from "next/link";

export default function RoutevisitPlan() {
  return (
    <Link href="/routeVisit/add">
      <button className="m-20">Add</button>
    </Link>
  );
}
