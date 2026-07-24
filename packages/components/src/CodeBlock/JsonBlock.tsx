import { CodeBlock } from './CodeBlock.tsx';

export interface JsonBlockProps {
  /** Any JSON-serialisable value. Pretty-printed with 2-space indentation. */
  value: unknown;
  copyable?: boolean;
  className?: string;
}

/**
 * A CodeBlock that pretty-prints a JSON value. Useful for tool-call arguments
 * and payloads. Non-serialisable values fall back to String().
 */
export function JsonBlock({ value, copyable = true, className }: JsonBlockProps) {
  let text: string;
  try {
    text = JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    text = String(value);
  }
  return <CodeBlock code={text} language="json" copyable={copyable} className={className} />;
}
