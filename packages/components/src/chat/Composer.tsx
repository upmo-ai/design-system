import { ActionIcon, Button, Menu, Textarea } from '@mantine/core';
import {
  IconArrowUp,
  IconChevronDown,
  IconCpu,
  IconMicrophone,
  IconPaperclip,
} from '@tabler/icons-react';
import clsx from 'clsx';
import type { KeyboardEvent, ReactNode } from 'react';
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
  /** Disable sending regardless of content (e.g. while a reply streams). */
  disabled?: boolean;
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
 * and send is disabled while the draft is empty. The whole composer carries one
 * emerald focus ring.
 */
export function Composer({
  value,
  onChange,
  onSend,
  placeholder = 'Message Upmo',
  disabled,
  config,
  toolsMode,
  onAttach,
  onDictate,
  hint,
  className,
}: ComposerProps) {
  const empty = value.trim() === '';
  const canSend = !empty && !disabled;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
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
                  aria-label={config.label}
                  leftSection={<IconCpu size={14} />}
                  rightSection={<IconChevronDown size={13} />}
                >
                  {summarise(config)}
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
                        <Menu.Item
                          key={opt.value}
                          onClick={() => group.onChange(opt.value)}
                          data-selected={opt.value === group.value ? 'true' : undefined}
                        >
                          {opt.label}
                        </Menu.Item>
                      ))}
                    </Menu.Sub.Dropdown>
                  </Menu.Sub>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}

          {onAttach ? (
            <ActionIcon
              type="button"
              variant="subtle"
              aria-label="Attach file"
              className="upmo-composer__icon"
              onClick={onAttach}
            >
              <IconPaperclip size={18} />
            </ActionIcon>
          ) : null}

          {onDictate ? (
            <ActionIcon
              type="button"
              variant="subtle"
              aria-label="Dictate"
              className="upmo-composer__icon"
              onClick={onDictate}
            >
              <IconMicrophone size={18} />
            </ActionIcon>
          ) : null}

          {toolsMode ? (
            <Menu position="top-start" withinPortal>
              <Menu.Target>
                <Button
                  type="button"
                  variant="subtle"
                  size="xs"
                  className="upmo-composer__pill"
                  aria-label="Tools mode"
                  rightSection={<IconChevronDown size={13} />}
                >
                  {toolsMode.options.find((o) => o.value === toolsMode.value)?.label ??
                    toolsMode.value}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Tools and context</Menu.Label>
                {toolsMode.options.map((opt) => (
                  <Menu.Item
                    key={opt.value}
                    onClick={() => toolsMode.onChange(opt.value)}
                    data-selected={opt.value === toolsMode.value ? 'true' : undefined}
                  >
                    {opt.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}

          <span className="upmo-composer__spacer" />

          <ActionIcon
            type="submit"
            variant="filled"
            size={30}
            aria-label="Send"
            className="upmo-composer__send"
            disabled={!canSend}
          >
            <IconArrowUp size={18} />
          </ActionIcon>
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
              <Kbd>⇧</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            for a new line
          </>
        )}
      </div>
    </div>
  );
}
