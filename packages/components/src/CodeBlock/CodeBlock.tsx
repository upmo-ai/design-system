import clsx from 'clsx';
import { CopyButton } from '../CopyButton/CopyButton.tsx';

export interface CodeBlockProps {
  /** The code to show. */
  code: string;
  /** Optional language hint, shown as a small label. No syntax highlighting. */
  language?: string;
  /** Show a copy button. Default true. */
  copyable?: boolean;
  className?: string;
}

/**
 * A block of monospace code or commands, on a sunken ground with a hairline
 * border. No syntax highlighting (kept honest and dependency-free); a copy
 * button is provided by default.
 */
export function CodeBlock({ code, language, copyable = true, className }: CodeBlockProps) {
  return (
    <div className={clsx('upmo-codeblock', className)}>
      <div className="upmo-codeblock__bar">
        <span className="upmo-codeblock__lang">{language ?? 'text'}</span>
        {copyable ? <CopyButton value={code} size={16} /> : null}
      </div>
      <pre className="upmo-codeblock__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
