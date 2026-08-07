import { Button, Menu, Textarea } from '@mantine/core';
import {
  IconArrowUp,
  IconCheck,
  IconChevronDown,
  IconCpu,
  IconMicrophone,
  IconPaperclip,
  IconPlayerStopFilled,
} from '@tabler/icons-react';
import clsx from 'clsx';
import type { KeyboardEvent, ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton.tsx';
import { Kbd, KbdGroup } from '../Kbd/Kbd.tsx';

export interface ComposerOption {
  value: string;
  label: string;
  description?: string;
}

export interface ComposerConfigMenu {
  /** Accessible label for the whole config pill, e.g. "Agent, route and model". */
  label: string;
  /** The groups the pill fans out to (Agent, Route, Model), each a list of options. */
  groups: {
    label: string;
    value: string;
    options: ComposerOption[];
    onChange: (value: string) => void;
  }[];
}

export interface ComposerProps {
  /** The draft text (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Send the current draft. Called on Enter (not Shift+Enter) and the send button. */
  onSend: () => void;
  placeholder?: string;
  /** Disable sending regardless of content. */
  disabled?: boolean;
  /** A reply is streaming. Sending is blocked; with `onStop`, send becomes Stop. */
  streaming?: boolean;
  /**
   * Stop the streaming reply. When set and `streaming` is true, the send button
   * becomes an always-enabled Stop button and Escape in the textarea stops too.
   */
  onStop?: () => void;
  /**
   * The model/agent/route configuration pill: one pill that fans out to nested
   * option groups. Its label summarises the current selection.
   */
  config?: ComposerConfigMenu;
  /** The tools-mode pill (Auto / All tools / Search only / Disabled). */
  toolsMode?: {
    value: string;
    options: ComposerOption[];
    onChange: (value: string) => void;
  };
  /** Attach handler; shows the paperclip when set. */
  onAttach?: () => void;
  /** Dictate handler; shows the microphone when set. */
  onDictate?: () => void;
  /** Hint line under the composer. Defaults to the Enter / Shift+Enter hint. */
  hint?: ReactNode;
  className?: string;
}

function summarise(config?: ComposerConfigMenu): string {
  if (!config) return '';
  return config.groups
    .map((g) => g.options.find((o) => o.value === g.value)?.label ?? g.value)
    .join(' · ');
}

/**
 * The chat composer: a borderless autosizing textarea over a pill toolbar. The
 * config pill fans out to nested Agent / Route / Model menus; the tools pill
 * picks the tools mode; attach and dictate are icon affordances; the round
 * emerald send sits at the right. Enter sends, Shift+Enter inserts a newline,
 * and send is disabled while the draft is empty. While a reply streams, send
 * turns into Stop (when `onStop` is given) so the user never digs to stop an
 * agent. The whole composer carries one emerald focus ring.
 */
export function Composer({
  value,
  onChange,
  onSend,
  placeholder = 'Message Upmo',
  disabled,
  streaming,
  onStop,
  config,
  toolsMode,
  onAttach,
  onDictate,
  hint,
  className,
}: ComposerProps) {
  const empty = value.trim() === '';
  const canSend = !empty && !disabled && !streaming;
  const canStop = Boolean(streaming && onStop);
  const summary = summarise(config);
  const toolsLabel = toolsMode
    ? (toolsMode.options.find((o) => o.value === toolsMode.value)?.label ?? toolsMode.value)
    : '';

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape' && canStop) {
      event.preventDefault();
      onStop?.();
      return;
    }
    // Enter that confirms an IME candidate (keyCode 229 in Safari) is not a send.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className={clsx('upmo-composer', className)}>
      <form
        className="upmo-composer__form"
        aria-label="Chat composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSend();
        }}
      >
        <Textarea
          className="upmo-composer__textarea"
          classNames={{ input: 'upmo-composer__input' }}
          aria-label="Message"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          autosize
          minRows={2}
          maxRows={10}
          variant="unstyled"
        />

        <div className="upmo-composer__row">
          {config ? (
            <Menu position="top-start" withinPortal>
              <Menu.Target>
                <Button
                  type="button"
                  variant="subtle"
                  size="xs"
                  className="upmo-composer__pill"
                  aria-label={`${config.label}: ${summary}`}
                  leftSection={<IconCpu size={14} />}
                  rightSection={<IconChevronDown size={13} />}
                >
                  {summary}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {config.groups.map((group) => (
                  <Menu.Sub key={group.label} position="right-start">
                    <Menu.Sub.Target>
                      <Menu.Sub.Item>{group.label}</Menu.Sub.Item>
                    </Menu.Sub.Target>
                    <Menu.Sub.Dropdown>
                      {group.options.map((opt) => (
                        <Menu.RadioItem
                          key={opt.value}
                          value={opt.value}
                          checked={opt.value === group.value}
                          onChange={group.onChange}
                          checkIcon={<IconCheck size={14} />}
                          closeMenuOnClick
                        >
                          {opt.label}
                        </Menu.RadioItem>
                      ))}
                    </Menu.Sub.Dropdown>
                  </Menu.Sub>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}

          {onAttach ? (
            <IconButton
              type="button"
              variant="subtle"
              aria-label="Attach file"
              tooltipPosition="top"
              className="upmo-composer__icon"
              onClick={onAttach}
            >
              <IconPaperclip size={18} />
            </IconButton>
          ) : null}

          {onDictate ? (
            <IconButton
              type="button"
              variant="subtle"
              aria-label="Dictate"
              tooltipPosition="top"
              className="upmo-composer__icon"
              onClick={onDictate}
            >
              <IconMicrophone size={18} />
            </IconButton>
          ) : null}

          {toolsMode ? (
            <Menu position="top-start" withinPortal>
              <Menu.Target>
                <Button
                  type="button"
                  variant="subtle"
                  size="xs"
                  className="upmo-composer__pill"
                  aria-label={`Tools mode: ${toolsLabel}`}
                  rightSection={<IconChevronDown size={13} />}
                >
                  {toolsLabel}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Tools and context</Menu.Label>
                {toolsMode.options.map((opt) => (
                  <Menu.RadioItem
                    key={opt.value}
                    value={opt.value}
                    checked={opt.value === toolsMode.value}
                    onChange={toolsMode.onChange}
                    checkIcon={<IconCheck size={14} />}
                    closeMenuOnClick
                  >
                    {opt.label}
                  </Menu.RadioItem>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}

          <span className="upmo-composer__spacer" />

          {canStop ? (
            <IconButton
              type="button"
              variant="filled"
              size="var(--control-sm)"
              aria-label="Stop"
              tooltipPosition="top"
              className="upmo-composer__send"
              onClick={onStop}
            >
              <IconPlayerStopFilled size={14} />
            </IconButton>
          ) : (
            <IconButton
              type="submit"
              variant="filled"
              size="var(--control-sm)"
              aria-label="Send"
              tooltipPosition="top"
              className="upmo-composer__send"
              disabled={!canSend}
            >
              <IconArrowUp size={18} />
            </IconButton>
          )}
        </div>
      </form>

      <div className="upmo-composer__hint">
        {hint ?? (
          <>
            <KbdGroup>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            to send
            <span className="upmo-composer__hint-sep">·</span>
            <KbdGroup>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            for a new line
          </>
        )}
      </div>
    </div>
  );
}
