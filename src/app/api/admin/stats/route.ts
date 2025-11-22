import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate date ranges
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch statistics
        const [
            totalUsers,
            emailVerifiedUsers,
            bannedUsers,
            twoFactorUsers,
            recentRegistrations7d,
            recentRegistrations30d
        ] = await Promise.all([
            // Total users
            db.selectFrom('user')
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
            
            // Email verified users
            db.selectFrom('user')
                .where('emailVerified', '=', true)
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
            
            // Banned users
            db.selectFrom('user')
                .where('banned', '=', true)
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
            
            // Two factor users
            db.selectFrom('user')
                .where('twoFactorEnabled', '=', true)
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
            
            // Recent registrations (7 days)
            db.selectFrom('user')
                .where('createdAt', '>=', sevenDaysAgo)
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
            
            // Recent registrations (30 days)
            db.selectFrom('user')
                .where('createdAt', '>=', thirtyDaysAgo)
                .select(db.fn.count('id').as('count'))
                .executeTakeFirst(),
        ]);

        const stats = {
            totalUsers: Number(totalUsers?.count || 0),
            emailVerifiedUsers: Number(emailVerifiedUsers?.count || 0),
            bannedUsers: Number(bannedUsers?.count || 0),
            twoFactorUsers: Number(twoFactorUsers?.count || 0),
            recentRegistrations7d: Number(recentRegistrations7d?.count || 0),
            recentRegistrations30d: Number(recentRegistrations30d?.count || 0),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
