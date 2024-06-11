import Link from "next/link";

export default function Home() {
  return (
    <main className="flex prose min-h-screen flex-col items-center p-24">
      <h1>cyber meeple</h1>
      <h2>games</h2>
      <ul>
        <li>
          <Link href="/tigris-euphrates">tigris & euphrates</Link>
        </li>
      </ul>
    </main>
  );
}
