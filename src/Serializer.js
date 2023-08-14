const { Node } = require("untrue");

class Serializer {
  static escape(string) {
    return string
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  static serialize(node, content = this.content.xml) {
    if (content !== this.content.xml && content !== this.content.html) {
      throw new Error('Invalid content type. Valid values are: "xml", "html".');
    }

    if (node === null || node === undefined || node === false) {
      return "";
    }

    if (!(node instanceof Node)) {
      return this.escape(`${node}`);
    }

    let string = "";

    const type = node.getType();
    const attributes = node.getAttributes();
    const children = node.getChildren();

    const keys = Object.keys(attributes);

    const attr =
      keys.length > 0
        ? keys
            .map((key) => `${key}="${this.escape(attributes[key])}"`)
            .join(" ")
        : null;

    const selfClose =
      content === this.content.html && this.htmlSelfClosingTags.includes(type);

    if (selfClose) {
      string += `<${type}${attr !== null ? ` ${attr}` : ""}/>`;
    } else {
      string += `<${type}${attr !== null ? ` ${attr}` : ""}>`;

      for (const child of children) {
        string += this.serialize(child, content);
      }

      string += `</${type}>`;
    }

    return string;
  }
}

Serializer.content = { xml: "xml", html: "html" };

Serializer.htmlSelfClosingTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

module.exports = Serializer;
