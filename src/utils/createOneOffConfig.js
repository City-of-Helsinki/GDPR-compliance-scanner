import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PAGE_URL,
  API_URL,
  VARIANTS = 'required,all',
  SCAN_NAME = 'one-off-scan',
} = process.env;

if (!PAGE_URL || !API_URL) {
  console.error('PAGE_URL and API_URL environment variables are required');
  process.exit(1);
}

const validVariants = ['none', 'required', 'all'];
const variantsArray = VARIANTS.split(',').map(v => v.trim()).filter(v => validVariants.includes(v));

if (variantsArray.length === 0) {
  console.error('No valid variants found. Use: none, required, all');
  process.exit(1);
}

const config = {
  name: SCAN_NAME,
  mainUrl: PAGE_URL,
  apiUrl: API_URL,
  settingsDomainSubstitution: PAGE_URL,
  urls: [{
    nameBase: 'Page',
    url: PAGE_URL,
    variants: variantsArray,
    headless: true,
    pause: false,
    skipNetworkIdle: false,
    waitForNetworkIdle: 5000,
    actions: [],
  }],
};

const configContent = `export const config = ${JSON.stringify(config, null, 2)};\n`;
const configDir = path.resolve(__dirname, '../../config');
const configPath = path.join(configDir, `${SCAN_NAME}.js`);

fs.writeFileSync(configPath, configContent);
// eslint-disable-next-line no-console
console.log(`Config written to: ${configPath}`);
