'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, createSession, clearSession } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Please fill all fields' }

    // Admin backdoor for demo
    if (email === 'admin@finvault.io' && password === 'admin123') {
        let admin = await prisma.user.findUnique({ where: { email } })
        if (!admin) {
            const hash = await hashPassword(password)
            admin = await prisma.user.create({
                data: { name: 'Admin', email, passwordHash: hash, role: 'ADMIN', balance: 0 }
            })
        }
        await createSession({ id: admin.id, email: admin.email, role: admin.role })
        return { success: true, redirect: '/admin' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await comparePassword(password, user.passwordHash))) {
        return { error: 'Invalid email or password' }
    }

    await createSession({ id: user.id, email: user.email, role: user.role })
    return { success: true, redirect: user.role === 'ADMIN' ? '/admin' : '/dashboard' }
}

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters long.'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*).'
    return null
}

export async function register(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const referrerId = formData.get('referrerId') as string

    if (!name || !email || !password) return { error: 'Please fill all fields' }

    const passwordError = validatePassword(password)
    if (passwordError) return { error: passwordError }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'Email already registered' }

    // Validate Referral ID if provided
    let refId: string | undefined = undefined
    if (referrerId && referrerId.trim() !== '') {
        const referrer = await prisma.user.findUnique({ where: { id: referrerId } })
        if (!referrer) return { error: 'Invalid Referral ID. Please check the ID or leave it empty.' }
        refId = referrer.id
    }

    const hash = await hashPassword(password)
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hash,
            bonusTradesRemaining: refId ? 2 : 0,
            referredBy: refId ? { connect: { id: refId } } : undefined
        }
    })

    // Grant bonus trades to referrer as well
    if (refId) {
        await prisma.user.update({
            where: { id: refId },
            data: { bonusTradesRemaining: { increment: 2 } }
        })
    }

    await createSession({ id: user.id, email: user.email, role: user.role })
    return { success: true, redirect: '/dashboard' }
}

export async function logout() {
    await clearSession()
    return { success: true, redirect: '/' }
}

export async function getBalance(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } })
    return user?.balance || 0;
}

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string
    if (!email) return { error: 'Please enter your email address' }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // We shouldn't reveal if a user exists or not for security, just return success
        return { success: true }
    }

    const token = crypto.randomUUID()
    const expiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry }
    })

    // Check if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"FinVault Support" <noreply@finvault.io>',
                to: email,
                subject: "Reset Your FinVault Password",
                text: `You have requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
                html: `<p>You have requested a password reset.</p><p><a href="${resetLink}">Click here to set a new password</a></p><p>If you did not request this, please ignore this email.</p>`,
            });
            console.log(`✅ [Nodemailer] Password reset email sent to ${email}`);
        } catch (error) {
            console.error('Failed to send email:', error);
            // We still return success to the user for security, even if email fails
        }
    } else {
        // Fallback for local development when SMTP is not configured
        console.warn('⚠️ SMTP variables not configured in .env. Falling back to terminal output.');
        console.log(`\n\n[SIMULATED EMAIL TO ${email}]\nSubject: Password Reset Request\nLink: http://localhost:3000/reset-password?token=${token}\n\n`);
    }

    return { success: true }
}

export async function resetPassword(formData: FormData) {
    const token = formData.get('token') as string
    const password = formData.get('password') as string

    if (!token || !password) return { error: 'Invalid request' }

    const passwordError = validatePassword(password)
    if (passwordError) return { error: passwordError }

    const user = await prisma.user.findUnique({ where: { resetToken: token } })
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return { error: 'Reset link is invalid or has expired. Please request a new one.' }
    }

    const hash = await hashPassword(password)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hash,
            resetToken: null,
            resetTokenExpiry: null
        }
    })

    await clearSession()
    return { success: true, redirect: '/' }
}
