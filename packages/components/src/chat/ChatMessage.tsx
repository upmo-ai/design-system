import { ActionIcon, Text, Tooltip } from '@mantine/core';
import { IconActivity } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Caret } from '../status/Caret.tsx';
import { CopyButton } from '../CopyButton/CopyButton.tsx';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  /** Who sent the message. User right-aligns; assistant and system left-align. */
  role: ChatRole;
  /** The message text. Rendered as plain text (no markdown) unless children given. */
  content?: string;
  /** Rich body; overrides content when provided (e.g. a rendered markdown node). */
  children?: ReactNode;
  /** Model label for the assistant meta row. */
  model?: string;
  tokens?: number;
  /** Pre-formatted duration, e.g. "1.2 s". */
  duration?: string;
  /** Pre-formatted cost, e.g. "$0.002". */
  cost?: string;
  /**
   * The assistant message is still streaming: the caret avatar sweeps live and
   * a subtle cursor trails the text. Under reduced motion the caret is static.
   */
  streaming?: boolean;
  /** Show the copy-reply action (assistant). The value copied is `content`. */
  copyable?: boolean;
  /** Open the activity/trace for this message (assistant). */
  onActivity?: () => void;
  className?: string;
}

/**
 * A single chat message. The user's message is a right-aligned bordered bubble;
 * the assistant's is a left-aligned reply led by the caret avatar (the brand
 * mark), with a meta row of model, tokens, duration and cost plus copy and
 * activity actions. A system message is a centered, quiet note. Streaming
 * assistant replies sweep the caret and show a trailing cursor.
 */
export function ChatMessage({
  role,
  content,
  children,
  model,
  tokens,
  duration,
  cost,
  streaming,
  copyable = true,
  onActivity,
  className,
}: ChatMessageProps) {
  const body = children ?? <Text className="upmo-chat-msg__text">{content}</Text>;

  if (role === 'user') {
    return (
      <div className={clsx('upmo-chat-msg', 'upmo-chat-msg--user', className)}>
        <div className="upmo-chat-msg__bubble">{body}</div>
        {tokens != null || cost ? (
          <div className="upmo-chat-msg__meta upmo-chat-msg__meta--user">
            {[tokens != null ? `${tokens} tokens` : null, cost].filter(Boolean).join(' · ')}
          </div>
        ) : null}
      </div>
    );
  }

  if (role === 'system') {
    return (
      <div className={clsx('upmo-chat-msg', 'upmo-chat-msg--system', className)}>
        <div className="upmo-chat-msg__system">{body}</div>
      </div>
    );
  }

  // assistant
  const meta = [model ?? 'Upmo', tokens != null ? `${tokens} tokens` : null, duration, cost]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={clsx('upmo-chat-msg', 'upmo-chat-msg--assistant', className)}>
      <span
        className={clsx('upmo-chat-msg__avatar', 'upmo-tone-active')}
        aria-hidden="true"
      >
        <Caret mark={streaming ? 'caret-live' : 'caret-undrawn'} size={18} />
      </span>
      <div className="upmo-chat-msg__reply">
        <div className={clsx('upmo-chat-msg__text', streaming && 'upmo-chat-msg__text--streaming')}>
          {body}
        </div>
        <div className="upmo-chat-msg__meta">
          <span>{meta}</span>
          {copyable && content ? (
            <CopyButton value={content} label="Copy reply" copiedLabel="Copied" size={15} />
          ) : null}
          {onActivity ? (
            <Tooltip label="Activity" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Activity"
                className="upmo-icon-button"
                onClick={onActivity}
              >
                <IconActivity size={15} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}
