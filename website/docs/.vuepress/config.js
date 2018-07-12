const manifest = require('./public/manifest.json');

module.exports = {
  title: 'Plek',
  description: 'Make continuous deployment delightful.',
  themeConfig: {
    repo: 'voorhoede/plek',
    editLinks: true,
    docsDir: 'docs',
    nav: [
      { text: 'Documentation', link: '/guide/' },
      { text: 'Install App', link: 'https://github.com/apps/plek' },
      { text: 'Changelog', link: 'https://github.com/voorhoede/plek/blob/master/changelog.md' },
    ],
    sidebarDepth: 2,
    sidebar: [
      '/',
      '/guide/',
      '/guide/getting-started',
      '/guide/usage'
    ],
  },
  head: [
    ['link', { rel: 'icon', href: `/logo.svg` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: manifest.theme_color }],
  ],
  serviceWorker: true,
  evergreen: true,
};
