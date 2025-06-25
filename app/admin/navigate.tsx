"use client";

import { useRouter } from "next/navigation";

export default function SomeComponent() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/admindaikolado")}>
    </button>
  );
}
