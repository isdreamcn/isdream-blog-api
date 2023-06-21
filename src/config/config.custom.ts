const packageData = require('../../package.json');
import { join } from 'path';
import { tmpdir } from 'os';

// upload
export const uploadTmpdir = join(tmpdir(), 'midway-upload-files');
export const uploadFileFolder = join(__dirname, '../../upload-files');

// sitemap
export const sitemapPath = join(__dirname, '../../sitemap.txt');

// logs
export const logsPath = join(__dirname, `../../logs/${packageData.name}`);
