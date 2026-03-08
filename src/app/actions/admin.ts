'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function processTransaction(txId: string, action: 'approve' | 'reject') {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

    const tx = await prisma.transaction.findUnique({ where: { id: txId }, include: { user: true } })
    if (!tx || tx.status !== 'pending') return { error: 'Transaction not found or already processed' }

    if (action === 'reject') {
        await prisma.$transaction(async (prismaTx: Prisma.TransactionClient) => {
            await prismaTx.transaction.update({
                where: { id: txId },
                data: { status: 'rejected', processedAt: new Date() }
            })
            // Refund the user if it was a withdrawal
            if (tx.type === 'withdraw') {
                await prismaTx.user.update({
                    where: { id: tx.userId },
                    data: { balance: { increment: tx.amount } }
                })
            }
        })
    } else {
        // Approve
        await prisma.$transaction(async (prismaTx: Prisma.TransactionClient) => {
            await prismaTx.transaction.update({
                where: { id: txId },
                data: { status: 'approved', processedAt: new Date() }
            })

            // Only add balance for deposits. Withdrawals were already deducted when requested.
            if (tx.type === 'deposit') {
                await prismaTx.user.update({
                    where: { id: tx.userId },
                    data: { balance: { increment: tx.amount } }
                })
            }
        })
    }

    revalidatePath('/admin')
    revalidatePath('/admin/transactions')
    return { success: true }
}

export async function updateUserBalance(formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

    const userId = formData.get('userId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const note = formData.get('note') as string

    if (!userId || isNaN(amount) || amount < 0) return { error: 'Invalid data' }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { error: 'User not found' }

    const updateType = formData.get('type') as string || 'Manual Update'
    const newBalance = targetUser.balance + amount

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { balance: newBalance }
        }),
        prisma.transaction.create({
            data: {
                type: 'admin_update',
                amount,
                status: 'approved',
                fromAddr: 'Admin',
                toAddr: '—',
                note: `${updateType}${note ? `: ${note}` : ''}`,
                processedAt: new Date(),
                userId: userId
            }
        })
    ])

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true }
}

export async function applyGlobalPercentage(formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

    const percentage = parseFloat(formData.get('percentage') as string)
    const note = formData.get('note') as string

    if (isNaN(percentage)) return { error: 'Invalid percentage' }

    // Fetch all regular users
    const users = await prisma.user.findMany({
        where: { role: 'USER' }
    })

    const transactions = []

    for (const user of users) {
        let currentPercent = percentage
        let isBonus = false

        // Override with 4% if user has bonus trades remaining
        if (user.bonusTradesRemaining > 0) {
            currentPercent = 4
            isBonus = true
        }

        // Calculate the profit/loss amount
        const amountChange = user.balance * (currentPercent / 100)
        const newBalance = Math.max(0, user.balance + amountChange)

        if (amountChange === 0) continue

        // Prepare the transaction data
        transactions.push(prisma.user.update({
            where: { id: user.id },
            data: {
                balance: newBalance,
                bonusTradesRemaining: isBonus ? { decrement: 1 } : undefined
            }
        }))
        transactions.push(prisma.transaction.create({
            data: {
                type: 'admin_update',
                amount: Math.abs(amountChange),
                status: 'approved',
                fromAddr: 'Admin',
                toAddr: '—',
                note: isBonus
                    ? `Referral Bonus Applied (4.00%) | ${user.bonusTradesRemaining - 1} remaining`
                    : (note || `Global ${percentage > 0 ? 'Profit' : 'Loss'} (${percentage}%) applied`),
                processedAt: new Date(),
                userId: user.id
            }
        }))
    }

    if (transactions.length > 0) {
        await prisma.$transaction(transactions)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true, count: users.length }
}
