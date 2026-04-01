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
    const toAddr = '0x6889c906e30cab91a4ffe83561e538f4e061d97e'

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

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
            transactions: {
                where: { status: 'approved' }
            }
        }
    })

    if (!user || user.balance < amount) {
        return { error: 'Insufficient balance' }
    }

    const totalDeposited = user.transactions.filter((t: any) => t.type === 'deposit').reduce((sum: number, tx: any) => sum + tx.amount, 0)
    const totalWithdrawn = user.transactions.filter((t: any) => t.type === 'withdraw').reduce((sum: number, tx: any) => sum + tx.amount, 0)

    // Lifestyle Earnings = (Current Balance + Total Withdrawn) - Total Deposited
    // Basically: How much profit have you ever made?
    const lifetimeEarnings = (user.balance + totalWithdrawn) - totalDeposited

    // Milestone Check: If you have earned at least as much as you've put in, you've doubled.
    // If you deposit more, the threshold goes up.
    const hasDoubled = totalDeposited > 0 && lifetimeEarnings >= totalDeposited

    const feePercent = hasDoubled ? 0.02 : 0.25
    const feeAmount = amount * feePercent
    const netAmount = amount - feeAmount

    const fromAddr = ''

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                type: 'withdraw',
                amount,
                fromAddr,
                toAddr,
                note: `Fee: $${feeAmount.toFixed(2)} (${(feePercent * 100).toFixed(0)}%) | Net: $${netAmount.toFixed(2)}`,
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
