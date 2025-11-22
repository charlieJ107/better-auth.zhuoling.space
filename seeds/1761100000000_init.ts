import type { Kysely } from 'kysely'
import { auth } from '../src/lib/auth';

// replace `any` with your database interface.
export async function seed(db: Kysely<any>): Promise<void> {
	// seed code goes here...
	// note: this function is mandatory. you must implement this function.

	// Check if there is no admin user
	const user = await db.selectFrom('user').where('role', '=', 'admin').executeTakeFirst();
	if (!user) {
		console.log('No admin user found, creating one...');

		const internalAdapter = (await auth.$context).internalAdapter;
		const createdAt = new Date();
		const user = await internalAdapter.createUser({
			username: 'admin',
			displayUsername: 'Admin',
			email: process.env.ADMIN_EMAIL || 'admin@example.com',
			emailVerified: true,
			name: 'Admin',
			role: 'admin',
			createdAt: createdAt,
			updatedAt: createdAt,
		});
		// generate a random 8 character string as password
		const passwordStr = Math.random().toString(36).substring(2, 15);
		await internalAdapter.linkAccount({
			userId: user.id,
			accountId: user.id,
			providerId: 'credential',
			password: await (await auth.$context).password.hash(passwordStr),
		});

		console.log("Displaying password to console");
		console.log(passwordStr);
		console.warn("Displaying password to console instead is not recommended, please change the password after you have logged in once");

	} else {
		console.log('Admin user already exists', user);
	}
}

