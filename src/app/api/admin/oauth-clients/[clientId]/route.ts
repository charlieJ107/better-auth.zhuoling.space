import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateRedirectUris } from "@/lib/oauth-clients";
import { OAuthApplication } from "@/lib/db/models";
import {
    updateOAuthClientRequestSchema,
    normalizeRedirectUris,
    normalizeOptionalInput,
} from "@/lib/oauth-client-dto";

export async function GET(request: NextRequest, { params }: {
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

        // Get client from database
        const client = await db.selectFrom('oauthApplication')
            .where('clientId', '=', clientId)
            .selectAll()
            .executeTakeFirst();

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Database field is redirectUrls (changed from redirectURLs) after migration
        const redirectUrlsValue = client.redirectUrls || '';
        const redirectArray = redirectUrlsValue
            ? redirectUrlsValue.split(',').map((uri: string) => uri.trim()).filter(Boolean)
            : [];

        const { redirectUrls, ...rest } = client;
        return NextResponse.json({
            ...rest,
            redirectURIs: redirectArray,
            redirectURLsRaw: redirectUrlsValue,
        });
    } catch (error) {
        console.error('Error fetching OAuth client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: {
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
        const body = await request.json();
        const parseResult = updateOAuthClientRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error }, { status: 400 });
        }
        const { name, redirectURIs, icon, metadata, disabled, type } = parseResult.data;

        const normalizedRedirects = normalizeRedirectUris(redirectURIs);

        const uriValidation = validateRedirectUris(normalizedRedirects);
        if (!uriValidation.valid) {
            return NextResponse.json({ error: uriValidation.errors.join(', ') }, { status: 400 });
        }

        // Update client in database
        const updateData: Partial<OAuthApplication> = {
            updatedAt: new Date()
        };

        if (name !== undefined) updateData.name = name;
        if (redirectURIs !== undefined) {
            // Database field is redirectUrls (changed from redirectURLs) after migration
            updateData.redirectUrls = normalizedRedirects.join(',');
        }
        if (icon !== undefined) updateData.icon = normalizeOptionalInput(icon);
        if (metadata !== undefined) updateData.metadata = metadata;
        if (disabled !== undefined) updateData.disabled = disabled;
        if (type !== undefined) updateData.type = type;

        const result = await db.updateTable('oauthApplication')
            .set(updateData)
            .where('clientId', '=', clientId)
            .execute();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Return updated client
        const updatedClient = await db.selectFrom('oauthApplication')
            .where('clientId', '=', clientId)
            .selectAll()
            .executeTakeFirst();

        if (!updatedClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Database field is redirectUrls (changed from redirectURLs) after migration
        const redirectUrlsValue = updatedClient.redirectUrls || '';
        const redirectArray = redirectUrlsValue
            ? redirectUrlsValue.split(',').map((uri: string) => uri.trim()).filter(Boolean)
            : [];

        const { redirectUrls, ...rest } = updatedClient;
        return NextResponse.json({
            ...rest,
            redirectURIs: redirectArray,
            redirectURLsRaw: redirectUrlsValue,
        });
    } catch (error) {
        console.error('Error updating OAuth client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: {
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

        // Delete client from database
        const result = await db.deleteFrom('oauthApplication')
            .where('clientId', '=', clientId)
            .execute();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting OAuth client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
