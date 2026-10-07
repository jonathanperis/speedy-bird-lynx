import { ELEMENT_NODE, parse, render, walkSync } from 'ultrahtml';

/**
 * Adapt the compiled wiki HTML for its published route and combined manual.
 *
 * Headings get a `doc-h<level>` class from their Markdown level, which the manual styles use.
 * On the combined manual the page layout owns the only H1, so every guide heading moves down
 * one level (H1 -> H2, ...); individual guide pages keep the guide's own H1 as the page H1.
 */
export async function renderDoc(html: string, slug: string, docsBase: string, combined: boolean) {
  const tree = parse(html);
  walkSync(tree, (node) => {
    if (node.type !== ELEMENT_NODE) return;

    const heading = /^h([1-6])$/.exec(node.name);
    if (heading) {
      const level = Number(heading[1]);
      node.attributes.class = [node.attributes.class, `doc-h${level}`].filter(Boolean).join(' ');
      if (combined) node.name = `h${Math.min(6, level + 1)}`;

      const id = node.attributes.id;
      if (id === slug) delete node.attributes.id; // The section owns the public slug.
      else if (id && combined) node.attributes.id = `${slug}-${id}`;
    }

    const href = node.attributes.href;
    if (!href) return;
    const pageLink = /^([a-z0-9-]+)\.md(#.*)?$/.exec(href);
    if (pageLink) {
      const page = pageLink[1] === 'index' ? '' : `${pageLink[1]}/`;
      node.attributes.href = `${docsBase}/${page}${pageLink[2] ?? ''}`;
    } else if (combined && href.startsWith('#') && href !== `#${slug}`) {
      node.attributes.href = `#${slug}-${href.slice(1)}`;
    }
  });
  return render(tree);
}
