import { ELEMENT_NODE, parse, render, walkSync } from 'ultrahtml';

/** Adapt the compiled wiki HTML for its published route and combined manual. */
export async function renderDoc(html: string, slug: string, docsBase: string, combined: boolean) {
  const tree = parse(html);
  walkSync(tree, (node) => {
    if (node.type !== ELEMENT_NODE) return;

    if (/^h[1-6]$/.test(node.name) && node.attributes.id) {
      const id = node.attributes.id;
      if (id === slug) delete node.attributes.id; // The section owns the public slug.
      else if (combined) node.attributes.id = `${slug}-${id}`;
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
