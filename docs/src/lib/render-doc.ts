import { ELEMENT_NODE, type Node, parse, render, TEXT_NODE, walkSync } from 'ultrahtml';

export interface RenderedDoc {
  /** Text of the guide's own H1, which the page header renders. */
  title: string;
  /** Second-level headings for "On this page". */
  headings: { id: string; text: string }[];
  html: string;
  /** Plain text for the search index. */
  text: string;
}

const CALLOUTS = { note: 'Note', hold: 'Hold', verified: 'Verified' } as const;

const textOf = (node: Node) => {
  let text = '';
  walkSync(node, (child) => {
    if (child.type === TEXT_NODE) text += child.value;
  });
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Adapt compiled wiki HTML for its manual page:
 * - the first H1 is removed (the page header shows it) and returned as the title;
 * - H2s are collected for "On this page";
 * - wiki links (`page.md#anchor`) point at the published routes;
 * - blockquotes starting with **Note:**, **Hold:** or **Verified:** become typed callouts;
 * - tables are wrapped so they scroll on narrow screens instead of the page.
 */
export async function renderDoc(html: string, docsBase: string): Promise<RenderedDoc> {
  const tree = parse(html);
  let title = '';
  let titleNode: { node: Node; parent: Node } | undefined;
  const headings: RenderedDoc['headings'] = [];

  walkSync(tree, (node, parent) => {
    if (node.type !== ELEMENT_NODE) return;

    // Remember the H1 and remove it after the walk: removing it now would shift the array
    // walkSync is iterating and skip the next sibling.
    if (node.name === 'h1' && !title && parent) {
      title = textOf(node);
      titleNode = { node, parent };
      return;
    }
    if (node.name === 'h2' && node.attributes.id) headings.push({ id: node.attributes.id, text: textOf(node) });

    const href = node.attributes.href;
    if (href) {
      const pageLink = /^([a-z0-9-]+)\.md(#.*)?$/.exec(href);
      if (pageLink) {
        const page = pageLink[1] === 'index' ? '' : `${pageLink[1]}/`;
        node.attributes.href = `${docsBase}/${page}${pageLink[2] ?? ''}`;
      }
    }

    if (node.name === 'blockquote') {
      const first = node.children.find((child) => child.type === ELEMENT_NODE) as Node | undefined;
      const strong = first?.children?.find((child: Node) => child.type === ELEMENT_NODE) as Node | undefined;
      const label = strong?.name === 'strong' ? textOf(strong).replace(/:$/, '').toLowerCase() : '';
      if (label in CALLOUTS) {
        node.name = 'aside';
        node.attributes.class = `callout callout-${label}`;
        node.attributes['aria-label'] = CALLOUTS[label as keyof typeof CALLOUTS];
      }
    }

    if (node.name === 'table' && parent && parent.attributes?.class !== 'table-wrap') {
      const wrapper: Node = {
        type: ELEMENT_NODE,
        name: 'div',
        attributes: { class: 'table-wrap' },
        children: [node],
        parent,
      } as Node;
      parent.children.splice(parent.children.indexOf(node), 1, wrapper);
      node.parent = wrapper;
    }
  });

  if (!title || !titleNode) throw new Error('Wiki page has no H1');
  titleNode.parent.children.splice(titleNode.parent.children.indexOf(titleNode.node), 1);
  return { title, headings, html: await render(tree), text: textOf(tree) };
}
