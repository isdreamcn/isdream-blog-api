const packageData = require('../../package.json');
import { join } from 'path';

export const uploadFileFolder = join(__dirname, '../../upload-files');
export const sitemapPath = join(__dirname, '../../sitemap.txt');
export const logsPath = join(__dirname, `../../logs/${packageData.name}`);
