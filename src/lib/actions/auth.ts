"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";

export async function signup(formData: FormData) {
  const name =
    `${formData.get("firstName")} ${formData.get("lastName")}`.trim();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const wantsToHost = formData.get("host") === "on";

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: wantsToHost ? "host" : "traveler",
    },
  });

  // Auto sign in after signup
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // sign-in after signup failed, user can log in manually
  }

  return { success: true };
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: "Invalid email or password" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
}
