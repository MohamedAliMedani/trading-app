'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, createSession, clearSession } from '@/lib/auth'

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

export async function register(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) return { error: 'Please fill all fields' }
    if (password.length < 6) return { error: 'Password must be at least 6 characters' }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'Email already registered' }

    const hash = await hashPassword(password)
    const user = await prisma.user.create({
        data: { name, email, passwordHash: hash }
    })

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
