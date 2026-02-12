import { ClassComponent, FunctionComponent, Props, Slot } from "untrue";

export type ContentFormat = "xml" | "html";

export class Serializer {
  public static serialize(slot: Slot, format: ContentFormat = "html"): string {
    if (!["xml", "html"].includes(format)) {
      throw new Error('Valid formats are: "xml", "html".');
    }

    if (!(slot instanceof Slot)) {
      throw new Error("Invalid slot.");
    }

    return this.serializeSlot(slot, format);
  }

  private static serializeSlot(slot: any, format: ContentFormat): string {
    if (slot === null || slot === undefined || slot === false) {
      return "";
    }

    if (!(slot instanceof Slot)) {
      return this.escape(`${slot}`);
    }

    if (slot.isClass()) {
      const ComponentClass = slot.getContentType() as ClassComponent;
      const props = slot.getProps() as Props;

      const component = new ComponentClass(props);

      const children = component.render();

      slot.setChildren(children);

      return this.serializeChildren(slot, format);
    } else if (slot.isFunction()) {
      const ComponentFunction = slot.getContentType() as FunctionComponent;
      const props = slot.getProps() as Props;

      const children = ComponentFunction(props);

      slot.setChildren(children);

      return this.serializeChildren(slot, format);
    } else if (slot.isElement()) {
      let result = "";

      const tagName = slot.getContentType() as string;
      const attributes = slot.getAttributes() ?? {};

      const keys = Object.keys(attributes);

      const attr =
        keys.length !== 0
          ? keys
              .map((key): string => `${key}="${this.escape(attributes[key])}"`)
              .join(" ")
          : null;

      let selfClose = false;

      switch (format) {
        case "html": {
          selfClose = this.htmlSelfClosingTags.has(tagName);

          break;
        }

        case "xml": {
          const children = slot.getChildren();

          selfClose = children.length === 0;

          break;
        }
      }

      result += `<${tagName}`;

      if (attr !== null) {
        result += ` ${attr}`;
      }

      if (selfClose) {
        result += " />";
      } else {
        result += ">";

        result += this.serializeChildren(slot, format);

        result += `</${tagName}>`;
      }

      return result;
    } else if (slot.isNull()) {
      return this.serializeChildren(slot, format);
    }

    return "";
  }

  private static serializeChildren(slot: Slot, format: ContentFormat): string {
    let result = "";

    for (const child of slot.getChildren()) {
      result += this.serializeSlot(child, format);
    }

    return result;
  }

  private static escape(source: string): string {
    return source
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private static htmlSelfClosingTags: Set<string> = new Set([
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
  ]);
}
