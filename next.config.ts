import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Native libSQL bindings must load from node_modules, not from the bundle.
  serverExternalPackages: ['@libsql/client', 'libsql'],
  sassOptions: {
    // Bootstrap 5.3 still uses @import and global Sass functions.
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
    quietDeps: true,
  },
};

export default nextConfig;
