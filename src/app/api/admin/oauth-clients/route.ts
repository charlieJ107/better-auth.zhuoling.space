import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateRedirectUris } from "@/lib/oauth-clients";
import {
    registerOAuthClientPayloadSchema,
    normalizeRedirectUris,
} from "@/lib/oauth-client-dto";

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = db.selectFrom('oauthApplication')
            .selectAll()
            .orderBy('createdAt', 'desc');

        // Add search filter if provided
        if (search) {
            query = query.where((eb) =>
                eb.or([
                    eb('name', 'ilike', `%${search}%`),
                    eb('clientId', 'ilike', `%${search}%`)
                ])
            );
        }

        // Add pagination
        query = query.limit(limit).offset(offset);

        const clients = await query.execute();

        const normalizedClients = clients.map(({ redirectURLs, ...rest }) => {
            const redirectArray = redirectURLs
                ? redirectURLs.split(",").map((uri) => uri.trim()).filter(Boolean)
                : [];

            return {
                ...rest,
                redirectURLs: redirectArray,
                redirectURLsRaw: redirectURLs,
            };
        });

        // Get total count for pagination
        let countQuery = db.selectFrom('oauthApplication').select(db.fn.count('id').as('count'));
        if (search) {
            countQuery = countQuery.where((eb) =>
                eb.or([
                    eb('name', 'ilike', `%${search}%`),
                    eb('clientId', 'ilike', `%${search}%`)
                ])
            );
        }
        const totalResult = await countQuery.executeTakeFirst();
        const total = Number(totalResult?.count || 0);

        return NextResponse.json({
            clients: normalizedClients,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching OAuth clients:', JSON.stringify(error, null, 2));
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = registerOAuthClientPayloadSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ message: 'Invalid request', error: parseResult.error }, { status: 400 });
        }

        const normalizedRedirectUris = normalizeRedirectUris(parseResult.data.redirect_uris);
        const redirectValidation = validateRedirectUris(normalizedRedirectUris);
        if (!redirectValidation.valid) {
            return NextResponse.json({ error: redirectValidation.errors.join(', ') }, { status: 400 });
        }

        const payload = {
            ...parseResult.data,
            redirect_uris: normalizedRedirectUris,
        };

        const result = await auth.api.registerOAuthApplication({
            body: payload,
            headers: request.headers
        });

        if (!result) {
            return NextResponse.json({ error: 'Failed to create OAuth client' }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating OAuth client:', JSON.stringify(error, null, 2));
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}
