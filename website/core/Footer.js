/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react")

class Footer extends React.Component {
  socialLink = ({ href, srcStub }) => (
    <a
      key={srcStub}
      href={href}
      target={href.startsWith("/") ? "self" : "blank"}>
      <img src={`/img/Icon-${srcStub}.svg`} alt={srcStub} />
    </a>
  )

  socialLinks = () =>
    [
      { href: "https://twitter.com/TQTezos", srcStub: "Twitter" },
      { href: "https://www.reddit.com/r/tezos/", srcStub: "Reddit" },
      { href: "https://medium.com/tqtezos", srcStub: "Medium" },
      {
        href: "https://www.linkedin.com/company/tqtezos/",
        srcStub: "LinkedIn",
      },
    ].map(this.socialLink)

  link = ({ href, text }) => (
    <li key={text}>
      <a href={href} target={href.startsWith("/") ? "self" : "blank"}>
        {text}
      </a>
    </li>
  )

  primaryLinks = () => (
    <ul className="primary">
      {[
        { href: "https://tqtezos.com", text: "Home" },
        { href: "/docs/enterprise/tezos-enterprise", text: "Enterprise" },
        { href: "/", text: "Assets" },
        { href: "https://medium.com/tqtezos", text: "Blog" },
        { href: "https://tqtezos.com/jobs", text: "Jobs" },
      ].map(this.link)}
      <li key="social" className="social">
        {this.socialLinks()}
      </li>
    </ul>
  )

  secondaryLinks = () => (
    <ul className="secondary">
      {[
        {
          href: "https://tezos.com/whitepaper.pdf",
          text: "White Paper",
        },
        {
          href:
            "https://tezos.com/position-paper.pdf",
          text: "Position Paper",
        },
        {
          href: "https://www.tezosagora.org/",
          text: "Agora | Governance",
        },
        {
          href: "https://tezos.com/developer-portal",
          text: "Developer Portal",
        },
        {
          href: "https://wiki.tezosagora.org/learn/baking",
          text: "Start Baking",
        },
      ].map(this.link)}
      <li key="social" className={["social", "show-medium"].join(" ")}>
        {this.socialLinks()}
      </li>
    </ul>
  )

  render() {
    return (
      <footer id="footer">
        <div className="row">
          <div
            className={[
              "footer-logo",
              "col-md-2",
              "col-sm-4",
              "col-xs-12",
            ].join(" ")}>
            <a href={this.props.config.baseUrl} className="nav-home">
              {this.props.config.footerIcon && (
                <img
                  src={this.props.config.baseUrl + this.props.config.footerIcon}
                  alt={this.props.config.title}
                  width="66"
                  height="58"
                />
              )}
              <aside>{this.props.config.copyright}</aside>
            </a>
          </div>
          {/* <div
                    className={[
                        "footer-logo",
                        "col-md-2",
                        "col-sm-4",
                        "col-xs-12",
                    ].join(" ")}>
                    <img src="img/logo-small.svg" alt="TQ Logo" />
                    <aside>
                        Copyright &copy; 2019 Tocqueville Group, Inc. All rights
                        reserved.
                    </aside>
                </div> */}
          <div
            className={["col-lg-4", "col-md-5", "col-sm-1", "hide-medium"].join(
              " "
            )}>
            {this.primaryLinks()}
          </div>
          <div
            className={["col-lg-4", "col-md-5", "col-sm-6", "col-xs-12"].join(
              " "
            )}>
            {this.secondaryLinks()}
          </div>
          {/* <div
                    className={classNames([
                        "col-lg-2",
                        "col-sm-12",
                        "col-xs-12",
                    ])}>
                    <ContactForm
                        variant="emailOnly"
                        layout="stacked"
                        buttonProps={{
                            variant: "outline",
                            color: "primary",
                            small: true,
                        }}
                        inputProps={{
                            labelText: "Subscribe for Updates",
                            textColor: "primary",
                            underlineColor: "white",
                            small: true,
                        }}
                    />
                </div> */}
        </div>
      </footer>
    )
  }
}

module.exports = Footer
