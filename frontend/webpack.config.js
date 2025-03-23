import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module'  // Ensure the output is an ES Module
    }
  },
  experiments: {
    outputModule: true  // Enable ES Module output
  },
  mode: 'production',
  target: 'web'  // Explicitly target browser environment
};