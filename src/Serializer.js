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

    if (node.isComponent()) {
      const Component = node.getType();
      const props = node.getProps();

      const component = new Component(props);

      const children = component.render();

      node.setChildren(children);

      for (const child of node.getChildren()) {
        string += this.serialize(child, content);
      }
    } else if (node.isFunction()) {
      const Function = node.getType();
      const props = node.getProps();

      const children = Function(props);

      node.setChildren(children);

      for (const child of node.getChildren()) {
        string += this.serialize(child, content);
      }
    } else if (node.isElement()) {
      const type = node.getType();
      const attributes = node.getAttributes();

      const keys = Object.keys(attributes);

      const attr =
        keys.length > 0
          ? keys
              .map((key) => `${key}="${this.escape(attributes[key])}"`)
              .join(" ")
          : null;

      const selfClose =
        content === this.content.html &&
        this.htmlSelfClosingTags.includes(type);

      if (selfClose) {
        string += `<${type}${attr !== null ? ` ${attr}` : ""}/>`;
      } else {
        string += `<${type}${attr !== null ? ` ${attr}` : ""}>`;

        for (const child of node.getChildren()) {
          string += this.serialize(child, content);
        }

        string += `</${type}>`;
      }
    } else if (node.isNull()) {
      for (const child of node.getChildren()) {
        string += this.serialize(child, content);
      }
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
