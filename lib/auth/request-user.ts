import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { getSessionUser } from "./session";

/**
 * Resolve the caller from either the email session cookie or a Google session.
 */
export async function getRequestUser(): Promise<{ id: string; role: string } | null> {
  const localUser = await getSessionUser();
  if (localUser) return localUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id, role: session.user.role };
}
