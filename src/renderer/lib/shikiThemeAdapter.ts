import type { ThemeRegistration } from 'shiki';
import { getXtermTheme, isTerminalThemeDark, type XtermTheme } from './ghosttyTheme';

export function createShikiThemeFromGhostty(
  terminalThemeName: string
): ThemeRegistration | undefined {
  const xtermTheme = getXtermTheme(terminalThemeName);
  if (!xtermTheme) return undefined;

  const isDark = isTerminalThemeDark(terminalThemeName);
  const themeName = `enso-${terminalThemeName.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    name: themeName,
    type: isDark ? 'dark' : 'light',
    colors: createEditorColors(xtermTheme, isDark),
    tokenColors: createTokenColors(xtermTheme),
  };
}

function createEditorColors(theme: XtermTheme, isDark: boolean): Record<string, string> {
  return {
    'editor.background': theme.background,
    'editor.foreground': theme.foreground,
    'editor.selectionBackground': theme.selectionBackground,
    'editor.lineHighlightBackground': isDark
      ? adjustAlpha(theme.foreground, 0.05)
      : adjustAlpha(theme.black, 0.03),
    'editorLineNumber.foreground': theme.brightBlack,
    'editorLineNumber.activeForeground': theme.foreground,
    'editorCursor.foreground': theme.cursor,
    'diffEditor.insertedTextBackground': isDark ? '#2ea04326' : '#2ea04320',
    'diffEditor.removedTextBackground': isDark ? '#f8514926' : '#f8514920',
    'diffEditor.insertedLineBackground': isDark ? '#2ea04315' : '#2ea04310',
    'diffEditor.removedLineBackground': isDark ? '#f8514915' : '#f8514910',
    'editorGutter.addedBackground': theme.green,
    'editorGutter.deletedBackground': theme.red,
    'editorGutter.modifiedBackground': theme.yellow,
    'editorBracketMatch.background': adjustAlpha(theme.cyan, 0.2),
    'editorBracketMatch.border': theme.cyan,
    'editorWidget.background': isDark ? adjustAlpha(theme.background, 0.95) : theme.background,
    'editorWidget.border': adjustAlpha(theme.foreground, 0.2),
  };
}

function createTokenColors(theme: XtermTheme): Array<{
  scope: string | string[];
  settings: { foreground?: string; fontStyle?: string };
}> {
  return [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: theme.brightBlack, fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'],
      settings: { foreground: theme.magenta },
    },
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: theme.green },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: theme.yellow },
    },
    {
      scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
      settings: { foreground: theme.cyan },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: theme.blue },
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: theme.red },
    },
    {
      scope: ['variable.other.property', 'support.variable.property'],
      settings: { foreground: theme.cyan },
    },
    {
      scope: ['entity.name.tag', 'support.tag'],
      settings: { foreground: theme.brightRed },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: theme.yellow },
    },
    {
      scope: ['keyword.operator', 'punctuation'],
      settings: { foreground: theme.foreground },
    },
    {
      scope: ['string.regexp'],
      settings: { foreground: theme.brightGreen },
    },
    {
      scope: ['constant.character.escape'],
      settings: { foreground: theme.brightCyan },
    },
    {
      scope: ['support.type.property-name.json'],
      settings: { foreground: theme.blue },
    },
    {
      scope: ['markup.heading'],
      settings: { foreground: theme.blue, fontStyle: 'bold' },
    },
    {
      scope: ['markup.bold'],
      settings: { fontStyle: 'bold' },
    },
    {
      scope: ['markup.italic'],
      settings: { fontStyle: 'italic' },
    },
    {
      scope: ['markup.inline.raw'],
      settings: { foreground: theme.green },
    },
    {
      scope: ['invalid', 'invalid.illegal'],
      settings: { foreground: theme.brightRed },
    },
  ];
}

function adjustAlpha(hex: string, alpha: number): string {
  const color = hex.replace('#', '');
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${color}${alphaHex}`;
}

export function getShikiThemeFallback(terminalThemeName: string): string {
  const isDark = isTerminalThemeDark(terminalThemeName);
  return isDark ? 'github-dark' : 'github-light';
}
