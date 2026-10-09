import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    tier?: string;
    isPro?: boolean;
  }

  interface Session {
    user: {
      id: string;
      tier?: string;
      isPro?: boolean;
    } & DefaultSession["user"];
  }
}
