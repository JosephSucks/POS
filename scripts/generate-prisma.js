import { execSync } from 'child_process';

console.log('[v0] Running Prisma code generation...');

try {
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('[v0] Prisma client generated successfully!');
} catch (error) {
  console.error('[v0] Failed to generate Prisma client:', error);
  process.exit(1);
}
