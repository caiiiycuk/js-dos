module.exports = {
  title: 'js-dos v7',
  tagline: 'The easiest API to run DOS games in browser',
  url: 'https://js-dos.com',
  baseUrl: '/v7/build/',
  favicon: 'img/favicon.ico',
  organizationName: 'caiiiycuk',
  projectName: 'js-dos',
  themeConfig: {
    navbar: {
      title: 'js-dos',
      logo: {
        alt: 'js-dos logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/caiiiycuk/js-dos',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Dos.Zone',
              href: 'https://dos.zone',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/doszone_db',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/caiiiycuk/js-dos',
            },
          ],
        },
      ],
      copyright: `${new Date().getFullYear()}, @caiiiycuk`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'doc1',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
