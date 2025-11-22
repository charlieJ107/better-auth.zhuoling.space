import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateClientSecret } from "@/lib/oauth-clients";


export async function POST(request: NextRequest, { params }: {
    params: Promise<{ clientId: string }>
}) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clientId } = await params;

        // Get current client to log the old secret
        const currentClient = await db.selectFrom('oauthApplication')
            .where('clientId', '=', clientId)
            .selectAll()
            .executeTakeFirst();

        if (!currentClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const newSecret = generateClientSecret();

        // Update client secret in database
        const result = await db.updateTable('oauthApplication')
            .set({
                clientSecret: newSecret,
                updatedAt: new Date()
            })
            .where('clientId', '=', clientId)
            .execute();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            clientSecret: newSecret
        });
    } catch (error) {
        console.error('Error rotating client secret:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
