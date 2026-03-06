import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TradingClient from '@/components/TradingClient'

export default async function TradingPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
            transactions: {
                where: {
                    status: 'approved',
                    // Fetch recent transactions to calculate "before" balance
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
                    }
                },
                orderBy: { date: 'desc' }
            }
        }
    })

    if (!user) redirect('/')

    // Calculate "Before" balance
    // This is basically current balance MINUS any profits/withdrawals/deposits that happened today
    let netToday = 0
    user.transactions.forEach(tx => {
        if (tx.type === 'deposit') netToday += tx.amount
        else if (tx.type === 'withdraw') netToday -= tx.amount
        else if (tx.type === 'admin_update') {
            const isLoss = tx.note?.toLowerCase().includes('loss') || tx.note?.toLowerCase().includes('deduction')
            if (isLoss) netToday -= tx.amount
            else netToday += tx.amount
        }
    })

    const beforeBalance = user.balance - netToday

    return <TradingClient userBalance={user.balance} beforeBalance={beforeBalance} />
}
