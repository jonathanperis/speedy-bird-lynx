// Shiki theme for code on paper (DESIGN.md). Every token color passes AA (6.2:1 or more) on
// the paper and sheet backgrounds; keywords are ink and bold rather than a new hue.
export const paperTheme = {
  name: 'speedy-paper',
  type: 'light',
  colors: {
    'editor.background': '#fffdf3',
    'editor.foreground': '#533847',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6e5462', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { foreground: '#533847', fontStyle: 'bold' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#4d6416' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#9a3b12' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#00636a' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class', 'support.class'], settings: { foreground: '#7b2d5b' } },
    { scope: ['variable.other.property', 'meta.object-literal.key'], settings: { foreground: '#7a4a00' } },
  ],
};
