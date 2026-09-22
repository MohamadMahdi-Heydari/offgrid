"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

const reservedUsernames = new Set(["admin", "root", "offgrid", "support"]);

const signupSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(8, "پسورد باید حداقل ۸ کاراکتر باشد"),
  username: z
    .string()
    .min(3, "یوزرنیم باید حداقل ۳ کاراکتر باشد")
    .max(30, "یوزرنیم باید حداکثر ۳۰ کاراکتر باشد")
    .regex(/^[a-zA-Z0-9_.-]+$/, "یوزرنیم فقط می‌تواند شامل حروف انگلیسی، عدد و ._- باشد"),
});

const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(1, "پسورد اجباری است"),
});

const forgotSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
});

const profileSchema = z.object({
  displayName: z.string().max(60, "نام نمایشی بیش از حد طولانی است").optional(),
  bio: z.string().max(400, "بیو بیش از حد طولانی است").optional(),
  city: z.string().max(60, "نام شهر بیش از حد طولانی است").optional(),
  job: z.string().max(60, "عنوان شغل بیش از حد طولانی است").optional(),
  avatarUrl: z.string().url("آدرس آواتار معتبر نیست").optional().or(z.literal("")),
});

function getSignupRedirect(email: string, error?: string) {
  const params = new URLSearchParams({ email });
  if (error) params.set("error", error);
  return `/signup?${params.toString()}`;
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    const fallbackEmail = String(formData.get("email") ?? "");
    redirect(getSignupRedirect(fallbackEmail, parsed.error.issues[0]?.message ?? "ورودی نامعتبر است"));
  }

  const { email, password, username } = parsed.data;

  if (reservedUsernames.has(username.toLowerCase())) {
    redirect(getSignupRedirect(email, "این یوزرنیم رزرو شده است"));
  }

  const supabase = await createClient();

  const { data: existingUsername, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  if (checkError) {
    console.error("SIGNUP username check error:", checkError);
    redirect(getSignupRedirect(email, `خطا در بررسی یوزرنیم: ${checkError.message}`));
  }

  if (existingUsername) {
    redirect(getSignupRedirect(email, "این یوزرنیم قبلاً گرفته شده است"));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/`,
    },
  });

  if (error) {
    console.error("SIGNUP error:", error);
    redirect(getSignupRedirect(email, `ثبت‌نام انجام نشد: ${error.message}`));
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

function getLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "ایمیل هنوز تأیید نشده است";
  }

  if (normalized.includes("invalid login credentials")) {
    return "ایمیل یا پسورد اشتباه است";
  }

  return "ورود انجام نشد. دوباره تلاش کن";
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است")}`);
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("LOGIN error:", error);
    redirect(`/login?error=${encodeURIComponent(getLoginErrorMessage(error.message))}`);
  }

  redirect("/");
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");

  if (!email) {
    redirect("/verify-email?error=ایمیل پیدا نشد");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/`,
    },
  });

  if (error) {
    console.error("RESEND_VERIFICATION error:", error);
    redirect(`/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(`ارسال مجدد انجام نشد: ${error.message}`)}`);
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}&resent=1`);
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(`/forgot-password?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "ایمیل نامعتبر است")}`);
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/reset-password`,
  });

  if (error) {
    console.error("FORGOT_PASSWORD error:", error);
    redirect(`/forgot-password?error=${encodeURIComponent(`ارسال ایمیل بازیابی انجام نشد: ${error.message}`)}`);
  }

  redirect(`/forgot-password?success=1&email=${encodeURIComponent(email)}`);
}

export async function updateProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();

    console.log("UPDATE_PROFILE auth.getUser:", {
      userId: userResult.data.user?.id ?? null,
      email: userResult.data.user?.email ?? null,
      authError: userResult.error?.message ?? null,
    });

    const user = userResult.data.user;

    if (!user) {
      redirect(`/settings/profile?error=${encodeURIComponent("نشست ورود شما معتبر نیست. دوباره وارد شوید")}`);
    }

    const parsed = profileSchema.safeParse({
      displayName: formData.get("display_name")?.toString().trim() ?? "",
      bio: formData.get("bio")?.toString().trim() ?? "",
      city: formData.get("city")?.toString().trim() ?? "",
      job: formData.get("job")?.toString().trim() ?? "",
      avatarUrl: formData.get("avatar_url")?.toString().trim() ?? "",
    });

    if (!parsed.success) {
      redirect(`/settings/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است")}`);
    }

    const { displayName, bio, city, job, avatarUrl } = parsed.data;

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        bio: bio || null,
        city: city || null,
        job: job || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("UPDATE_PROFILE update error:", updateError);
      redirect(`/settings/profile?error=${encodeURIComponent(`ذخیره پروفایل انجام نشد: ${updateError.message}`)}`);
    }

    if (!updated) {
      console.error("UPDATE_PROFILE missing profile row", { userId: user.id });
      redirect(
        `/settings/profile?error=${encodeURIComponent("پروفایل شما پیدا نشد. ابتدا SQL تریگر profiles را در Supabase اجرا کنید")}`,
      );
    }

    redirect("/settings/profile?success=1");
  } catch (error) {
    console.error("UPDATE_PROFILE unexpected error:", error);
    const message = error instanceof Error ? error.message : "unknown error";
    redirect(`/settings/profile?error=${encodeURIComponent(`خطای غیرمنتظره: ${message}`)}`);
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
