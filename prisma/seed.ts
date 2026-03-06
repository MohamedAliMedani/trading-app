import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@finvault.io'
    const adminPassword = 'admin123'

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    // We optionally check if a regular user exists but doesn't have ADMIN role
    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10)

        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'System Admin',
                passwordHash,
                role: 'ADMIN',
                balance: 1000000.0, // Initial platform balance for testing
            },
        })
        console.log('✅ Admin user created successfully: admin@finvault.io / admin123')
    } else if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'ADMIN' },
        })
        console.log('✅ Admin user role updated successfully.')
    } else {
        console.log('✅ Admin user already exists and has correct role.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
