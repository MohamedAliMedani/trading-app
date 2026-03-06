'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function requestDeposit(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const fromAddr = formData.get('fromAddr') as string

    if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' }
    if (!fromAddr) return { error: 'Invalid sending address' }

    // Platform wallet is hardcoded
    const toAddr = '0xA1B2C3D4E5F6a1b2c3d4e5f6A1B2C3D4E5F6a1b2'

    await prisma.transaction.create({
        data: {
            type: 'deposit',
            amount,
            fromAddr,
            toAddr,
            status: 'pending',
            userId: session.id
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
}

export async function requestWithdrawal(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string)
    const toAddr = formData.get('toAddr') as string

    if (isNaN(amount) || amount <= 0) return { error: 'Invalid amount' }
    if (!toAddr) return { error: 'Invalid receiving address' }

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user || user.balance < amount) {
        return { error: 'Insufficient balance' }
    }

    const fromAddr = '0xA1B2C3D4E5F6a1b2c3d4e5f6A1B2C3D4E5F6a1b2'

    await prisma.transaction.create({
        data: {
            type: 'withdraw',
            amount,
            fromAddr,
            toAddr,
            status: 'pending',
            userId: session.id
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
}
