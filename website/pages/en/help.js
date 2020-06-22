/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react")

const CompLibrary = require("../../core/CompLibrary.js")

const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

function Help(props) {
  const { config: siteConfig, language = "" } = props
  const { baseUrl, docsUrl } = siteConfig
  const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`
  const langPart = `${language ? `${language}/` : ""}`
  const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`

  const supportLinks = [
    {
      content: `Learn more using the [documentation on this site.](${docUrl(
        "intro"
      )})`,
      title: "Browse Docs",
    },
    // TODO: re-add when repo is open sourced
    // {
    //   content:
    //     "Do you have an update or correction to make? Are you interested in writing a new tutorial? Take a look at our guide to contributing in our [Github repository](https://github.com/tqtezos/assets.tqtezos.com)",
    //   title: "Contribute to This Site",
    // },
    // {
    //   content:
    //     "If you have difficulties with using the site or encounter a buggy behavior, you can open an issue with us [on Github](https://github.com/tqtezos/assets.tqtezos.com/issues) and we'll review it.",
    //   title: "File a Bug or Open an Issue",
    // },
    {
      content:
        "Get in touch with the TQ Tezos team on our [contact page](https://tqtezos.com/contact)",
      title: "Stay up to date",
    },
  ]

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>{"Need help?"}</h1>
          </header>
          <p>
            {"This project is maintained by a dedicated group of people at "}
            <a href="https://tqtezos.com">{"TQ Tezos"}</a>
            {"."}
          </p>
          <GridBlock contents={supportLinks} layout="twoColumn" />
        </div>
      </Container>
    </div>
  )
}

module.exports = Help
