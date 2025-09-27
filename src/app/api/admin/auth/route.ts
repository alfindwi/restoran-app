import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createServer } from "@/lib/supabase/server";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  const supabase = await createServer();

  const { email, password, name, action } = await req.json();

  if (!email || !password || (action === "register" && !name)) {
    return NextResponse.json(
      { error: "Email, password, dan name wajib diisi" },
      { status: 400 }
    );
  }

  if (action === "register") {
    // cek email sudah ada?
    const { data: existing, } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    // hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from("admin_users")
      .insert({ email, password_hash, name })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Register berhasil", admin: { id: data.id, email: data.email, name: data.name } });
  }

  // login
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, email, password_hash, name")
    .eq("email", email)
    .single();

  if (error || !admin) {
    return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login berhasil",
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
}
