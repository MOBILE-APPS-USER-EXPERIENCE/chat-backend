// src/scripts/hash-secret.ts
import { hashPassword } from "../lib/crypto";

const secret = process.argv[2];
if (!secret) {
    console.error('Verwendung: npm run hash-secret -- "dein-admin-schluessel"');
    process.exit(1);
}
console.log(hashPassword(secret));
