import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readAllowedPairs(): { email: string; password: string }[] {
  const pairs = [
    {
      email: process.env.AUTH_USER_1_EMAIL,
      password: process.env.AUTH_USER_1_PASSWORD,
    },
    {
      email: process.env.AUTH_USER_2_EMAIL,
      password: process.env.AUTH_USER_2_PASSWORD,
    },
  ];
  const out: { email: string; password: string }[] = [];
  for (const p of pairs) {
    if (typeof p.email !== "string" || typeof p.password !== "string") continue;
    const email = p.email.trim();
    const password = p.password.trim();
    if (!email || !password) continue;
    out.push({ email: email.toLowerCase(), password });
  }
  return out;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const allowedUsers = readAllowedPairs();
        const user = allowedUsers.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          return { id: user.email, email: user.email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
   session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
