module.exports = {
  title: 'js-dos v7',
  tagline: 'The simpliest API to run DOS games in browser',
  url: 'https://js-dos.com',
  baseUrl: '/v7/build/',
  favicon: 'favicon.ico',
  organizationName: 'caiiiycuk',
  projectName: 'js-dos',
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-178018235-1',
    },
    navbar: {
      title: 'js-dos',
      logo: {
        alt: 'js-dos logo',
        src: 'js-dos-logo.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
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
              label: 'Overview',
              to: 'docs/',
            },
            {
              label: 'Releases',
              to: 'docs/releases',
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
              label: 'Discord',
              href: 'https://discord.com/invite/hMVYEbG',
            },
            {
              label: 'Telegram',
              href: 'https://t.me/doszone',
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
              label: 'GitHub',
              href: 'https://github.com/caiiiycuk/js-dos',
            },
            {
              label: 'Donate',
              href: 'https://dos.zone/donate/',
            },
            {
              label: "js-dos powered",
              href: "https://discord.gg/EQQJhvGD",
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
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
