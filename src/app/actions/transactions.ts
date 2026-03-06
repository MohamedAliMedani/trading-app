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
    const toAddr = '0x287F999Ccd81589D1680ade934f9E6A4f881b0a2'

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

    const fromAddr = ''

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                type: 'withdraw',
                amount,
                fromAddr,
                toAddr,
                note: `Fee: $${(amount * 0.02).toFixed(2)} | Net: $${(amount * 0.98).toFixed(2)}`,
                status: 'pending',
                userId: session.id
            }
        }),
        prisma.user.update({
            where: { id: session.id },
            data: { balance: { decrement: amount } }
        })
    ])

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
}
