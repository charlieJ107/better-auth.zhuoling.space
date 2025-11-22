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

		const passwordStr = Math.random().toString(36).substring(2, 15);
		const response = await auth.api.createUser({
			body: {
				email: process.env.ADMIN_EMAIL || 'admin@zhuoling.space',
				password: passwordStr,
				name: 'Admin',
				role: 'admin',
				data: {
					username: 'admin',
					displayUsername: 'Admin',
					emailVerified: true,
				}
			}
		});
		if (response.user) {
			console.log('Admin user created:', JSON.stringify(response.user, null, 2));
			console.log("Displaying password to console");
			console.log(passwordStr);
			console.warn("Displaying password to console instead is not recommended, please change the password after you have logged in once");
			return;
		}

		throw new Error('Failed to create admin user');

	} else {
		console.log('Admin user already exists', user);
	}
}

