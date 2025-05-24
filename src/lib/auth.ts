import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
        },
      ])
      .select()
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
      },
      error: null,
    };
  } catch (error) {
    console.log(error);
    return { user: null, error: "Failed to create account" };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return { user: null, error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return { user: null, error: "Invalid email or password" };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      error: null,
    };
  } catch {
    return { user: null, error: "Failed to sign in" };
  }
}
