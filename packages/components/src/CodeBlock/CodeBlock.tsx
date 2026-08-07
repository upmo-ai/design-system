import { Highlight, type Language } from 'prism-react-renderer';
import clsx from 'clsx';
import { CopyButton } from '../CopyButton/CopyButton.tsx';
import { upmoPrismTheme } from './prismTheme.ts';

export interface CodeBlockProps {
  /** The code to show. */
  code: string;
  /**
   * Language for syntax highlighting, e.g. "tsx", "bash", "json", "python".
   * Defaults to "tsx". Pass "text" for no highlighting.
   */
  language?: string;
  /** Show a copy button. Default true. */
  copyable?: boolean;
  /** Show line numbers in a gutter. Default false. */
  lineNumbers?: boolean;
  className?: string;
}

/**
 * A block of code or commands on a sunken ground with a hairline border, a bar
 * showing the language and a copy button, and token syntax highlighting. The
 * highlight colours are Upmo tokens (the chart + ink scale), so they follow the
 * active theme in light, dark and high contrast. Pass language="text" to show
 * plain, unhighlighted monospace.
 */
export function CodeBlock({
  code,
  language = 'tsx',
  copyable = true,
  lineNumbers = false,
  className,
}: CodeBlockProps) {
  const trimmed = code.replace(/\n$/, '');

  return (
    <div className={clsx('upmo-codeblock', className)}>
      <div className="upmo-codeblock__bar">
        <span className="upmo-codeblock__lang">{language}</span>
        {copyable ? <CopyButton value={code} size={16} /> : null}
      </div>
      <Highlight theme={upmoPrismTheme} code={trimmed} language={language as Language}>
        {({ className: hlClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clsx('upmo-codeblock__pre', hlClass)} style={style}>
            <code className={clsx('upmo-codeblock__code', lineNumbers && 'upmo-codeblock__code--numbered')}>
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <span key={i} {...lineProps} className={clsx('upmo-codeblock__line', lineProps.className)}>
                    {lineNumbers ? <span className="upmo-codeblock__ln" aria-hidden="true">{i + 1}</span> : null}
                    <span className="upmo-codeblock__line-content">
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        return <span key={key} {...tokenProps} />;
                      })}
                    </span>
                  </span>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
