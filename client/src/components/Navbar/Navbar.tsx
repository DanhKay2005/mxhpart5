import { currentUser } from "@clerk/nextjs/server";
import { synUser } from "@/actions/user.action";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const user = await currentUser();
  if (user) await synUser();

  return <NavbarClient />;
}
