import { execSync } from 'child_process';
import path from 'path';

const libPath = path.join(process.cwd(), 'src', 'library');

try {
    execSync('npm unlink @devdash/library', { stdio: 'inherit' });
    execSync('npm un -g @devdash/library', { cwd: libPath, stdio: 'inherit' });
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
