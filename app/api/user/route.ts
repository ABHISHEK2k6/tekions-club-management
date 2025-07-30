import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import * as z from "zod";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

//Define a schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters')
  })

export async function POST(req: Request) {
  try {
    console.log('📝 Starting user registration process...');
    const body = await req.json();
    console.log('📨 Received body:', { email: body.email, username: body.username });
    const { email, username, password } = userSchema.parse(body);
    console.log('✅ Schema validation passed');

    //check if email already exists in users table
    const existingUserByEmail = await db.user.findUnique({
      where: { email: email }
    });
    if (existingUserByEmail) {
      return Response.json({ user: null, message: "User with this email already exists" }, { status: 409 });
    }

    //check if email already exists in pending users table
    const existingPendingUserByEmail = await db.pendingUser.findUnique({
      where: { email: email }
    });
    if (existingPendingUserByEmail) {
      // Delete the old pending registration and create a new one
      await db.pendingUser.delete({
        where: { email: email }
      });
    }

    //check if username already exists in users table
    const existingUserByUsername = await db.user.findUnique({
      where: { name: username }
    });
    if (existingUserByUsername) {
      return Response.json({ user: null, message: "User with this username already exists" }, { status: 409 });
    }

    //check if username already exists in pending users table
    const existingPendingUserByUsername = await db.pendingUser.findFirst({
      where: { name: username }
    });
    if (existingPendingUserByUsername) {
      return Response.json({ user: null, message: "User with this username already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    
    // Generate verification token
    const verificationToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store user data in pending users table (not in main users table yet)
    const pendingUser = await db.pendingUser.create({
      data: {
        email,
        name: username,
        password: hashedPassword,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Send verification email
    console.log('📧 Sending verification email to:', email);
    try {
      await sendVerificationEmail(email, verificationUrl);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // If email fails, delete the pending user
      await db.pendingUser.delete({
        where: { id: pendingUser.id }
      });
      return Response.json({ 
        user: null, 
        message: "Failed to send verification email. Please try again." 
      }, { status: 500 });
    }

    return Response.json({
      user: { email, name: username }, 
      message: "Account registration initiated! Please check your email to verify your account and complete the registration.",
      requiresVerification: true
    }, {status: 201});
  } catch (error) {
    console.error('❌ User registration failed:', error);
    return Response.json({ user: null, message: "Something went wrong" }, { status: 500 });
  }
}
