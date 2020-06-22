/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  // {
  //   caption: 'User1',
  //   // You will need to prepend the image path with your baseUrl
  //   // if it is not '/', like: '/test-site/img/image.jpg'.
  //   image: '/img/undraw_open_source.svg',
  //   infoLink: 'https://www.facebook.com',
  //   pinned: true,
  // },
]

const siteConfig = {
  title: "Digital Assets on Tezos", // Title for your website.
  tagline: "A website for testing", // TODO
  url: "https://assets.tqtezos.com", // Your website URL
  baseUrl: "/", // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: "assets.tqtezos.com",
  organizationName: "TQ Tezos",

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: "intro", label: "Docs" },
    { href: "https://tqtezos.com", label: "TQ Tezos" },
    { href: "https://tezos.com", label: "Tezos.com" },
    { href: "https://github.com/tqtezos/assets.tqtezos.com", label: "GitHub" },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: "img/tezos/logo-tezos.svg", //"img/logo-colored.svg",
  footerIcon: "img/logo-small.svg",
  favicon: "img/tezos/icon.png",
  // usePrism: true,
  /* Colors for website */
  colors: {
    secondaryColor: "rgb(18, 50, 98)", //"#2E7DF2",
    primaryColor: "rgb(44, 125, 247)", //"#052158",
  },

  /* Custom fonts for website
  https://docusaurus.io/docs/en/site-config#fonts-object */

  fonts: {
    // myFont: [
    //   "Roboto",
    //   "Roboto",
    //   "Serif"
    // ],
    // myOtherFont: [
    //   "-apple-system",
    //   "system-ui"
    // ]
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Tocqueville Group, Inc. All rights Reserved.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    // https://github.com/highlightjs/highlight.js/tree/master/src/styles
    theme: "vs",
      // "mono-blue",
      // "magula",
      // "foundation",
    defaultLang: 'shell',
  },

  gaTrackingId: "UA-134070504-2",

  stylesheets: [
    "https://fonts.googleapis.com/css?family=Roboto:300,400&display=swap",
  ],

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ["https://buttons.github.io/buttons.js"],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: "img/undraw_online.svg",
  twitterImage: "img/Icon-Twitter.svg",

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
