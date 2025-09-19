import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUp() {
  return (
    <main>
      <p>hello World</p>
      <Link href={"/home"}>
        <Button>Home</Button>
      </Link>
    </main>
  );
}
