import { execSync } from 'child_process';
import path from 'path';

const libPath = path.join(process.cwd(), 'src', 'library');

try {
    execSync('npm link', { cwd: libPath, stdio: 'inherit' });
    execSync('npm link @devdash/library', { stdio: 'inherit' });;
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
