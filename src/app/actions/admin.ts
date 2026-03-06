'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function processTransaction(txId: string, action: 'approve' | 'reject') {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

    const tx = await prisma.transaction.findUnique({ where: { id: txId }, include: { user: true } })
    if (!tx || tx.status !== 'pending') return { error: 'Transaction not found or already processed' }

    if (action === 'reject') {
        await prisma.transaction.update({
            where: { id: txId },
            data: { status: 'rejected', processedAt: new Date() }
        })
    } else {
        // Approve
        await prisma.$transaction(async (prismaTx) => {
            await prismaTx.transaction.update({
                where: { id: txId },
                data: { status: 'approved', processedAt: new Date() }
            })

            if (tx.type === 'deposit') {
                await prismaTx.user.update({
                    where: { id: tx.userId },
                    data: { balance: { increment: tx.amount } }
                })
            } else if (tx.type === 'withdraw') {
                const newBalance = Math.max(0, tx.user.balance - tx.amount)
                await prismaTx.user.update({
                    where: { id: tx.userId },
                    data: { balance: newBalance }
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

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { balance: amount }
        }),
        prisma.transaction.create({
            data: {
                type: 'admin_update',
                amount,
                status: 'approved',
                fromAddr: 'Admin',
                toAddr: '—',
                note: note || 'Manual balance update',
                processedAt: new Date(),
                userId: userId
            }
        })
    ])

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true }
}
