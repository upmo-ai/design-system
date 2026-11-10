import { Button, Menu, Textarea } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
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
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton.tsx';
import { Kbd, KbdGroup } from '../Kbd/Kbd.tsx';

export interface ComposerOption {
  value: string;
  label: string;
  /** A line under the label in the menu. It is the item's accessible description; the name stays the label. */
  description?: string;
  /**
   * A section label in a config-group menu. Consecutive options with the same
   * `group` sit under one label; options without one have no label.
   */
  group?: string;
  /**
   * Keep the option at the top of its config-group menu, above every section
   * label. A pinned option is never filtered out.
   */
  pinned?: boolean;
}

/** The form is narrower than this (px) when `toolbar="auto"` goes compact. */
const COMPACT_BELOW = 420;

export interface ComposerConfigMenu {
  /** Accessible label for the whole config pill, e.g. "Agent, route and model". */
  label: string;
  /** The groups the pill fans out to (Agent, Route, Model), each a list of options. */
  groups: {
    label: string;
    value: string;
    options: ComposerOption[];
    onChange: (value: string) => void;
    /**
     * Show a filter field at the top of the group's menu. It matches the label
     * and description, ignoring case. The text clears when the menu closes.
     */
    searchable?: boolean;
  }[];
  /**
   * The pill text when the toolbar is compact. Default: the selected label of
   * the last group (the model). In compact mode it is the pill's name after
   * `label`, so the visible text is part of the accessible name (speech control
   * says what it sees); the full selection becomes the pill's description.
   */
  compactSummary?: string;
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
  /**
   * How much of the toolbar shows. `"compact"` shortens the config pill to
   * `compactSummary`; `"auto"` does so when the composer is narrower than 420px.
   * `"full"` never does. Default `"auto"`.
   */
  toolbar?: 'auto' | 'full' | 'compact';
  /** Hint line under the composer. Defaults to the Enter / Shift+Enter hint. */
  hint?: ReactNode;
  className?: string;
}

const pillClassNames = { inner: 'upmo-composer__pill-inner', label: 'upmo-composer__pill-label' };

function currentLabel(group: ComposerConfigMenu['groups'][number]): string {
  return group.options.find((o) => o.value === group.value)?.label ?? group.value;
}

function summarise(config?: ComposerConfigMenu): string {
  if (!config) return '';
  return config.groups.map(currentLabel).join(' · ');
}

function compactLabel(config: ComposerConfigMenu): string {
  const last = config.groups[config.groups.length - 1];
  return config.compactSummary ?? (last ? currentLabel(last) : '');
}

/** A radio item: the label, and a quiet description under it when there is one. */
function OptionItem({
  option,
  checked,
  onChange,
  descriptionId,
  itemId,
}: {
  option: ComposerOption;
  checked: boolean;
  onChange: (value: string) => void;
  descriptionId: string;
  itemId?: string;
}) {
  return (
    <Menu.RadioItem
      id={itemId}
      value={option.value}
      checked={checked}
      onChange={onChange}
      checkIcon={<IconCheck size={14} />}
      closeMenuOnClick
      aria-label={option.label}
      aria-describedby={option.description ? descriptionId : undefined}
    >
      {option.description ? (
        <span className="upmo-composer__option">
          <span>{option.label}</span>
          <span id={descriptionId} className="upmo-composer__option-description">
            {option.description}
          </span>
        </span>
      ) : (
        option.label
      )}
    </Menu.RadioItem>
  );
}

function matches(option: ComposerOption, query: string): boolean {
  return `${option.label} ${option.description ?? ''}`.toLowerCase().includes(query);
}

/**
 * The options of one config group: pinned ones first, then the rest under
 * their section labels. With `searchable`, a filter field narrows the rest.
 * The state lives here, so it resets when the menu closes and this unmounts.
 */
function GroupOptions({
  group,
  groupId,
}: {
  group: ComposerConfigMenu['groups'][number];
  groupId: string;
}) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const needle = query.trim().toLowerCase();
  const entries = group.options.map((option, index) => ({ option, index }));
  const pinned = entries.filter((e) => e.option.pinned);
  const rest = entries.filter((e) => !e.option.pinned && (!needle || matches(e.option, needle)));
  // Consecutive options with one `group` form a section; the others stand alone.
  const sections: { label?: string; entries: typeof entries }[] = [];
  for (const entry of rest) {
    const last = sections[sections.length - 1];
    if (last && last.label === entry.option.group) last.entries.push(entry);
    else sections.push({ label: entry.option.group, entries: [entry] });
  }

  // Opening with the arrow key makes Mantine focus the first item after a beat.
  // Move focus on to the filter, but only when that happened (not on hover).
  useEffect(() => {
    if (!group.searchable) return;
    const timer = window.setTimeout(() => {
      const dropdown = inputRef.current?.closest('[data-menu-dropdown]');
      if (dropdown?.contains(document.activeElement) && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 40);
    return () => window.clearTimeout(timer);
  }, [group.searchable]);

  // Focus stays in the filter, so point the input at the option Mantine marks active.
  useEffect(() => {
    const dropdown = inputRef.current?.closest('[data-menu-dropdown]');
    if (!group.searchable || !dropdown) return;
    const sync = () => setActiveId(dropdown.querySelector('[data-menu-active]')?.id || undefined);
    const observer = new MutationObserver(sync);
    observer.observe(dropdown, { attributes: true, attributeFilter: ['data-menu-active'], subtree: true });
    return () => observer.disconnect();
  }, [group.searchable]);

  const renderItem = ({ option, index }: (typeof entries)[number]) => {
    const descriptionId = `${groupId}-option-${index}`;
    return (
      <OptionItem
        key={option.value}
        option={option}
        checked={option.value === group.value}
        onChange={group.onChange}
        descriptionId={descriptionId}
        itemId={`${descriptionId}-item`}
      />
    );
  };
  return (
    <>
      {group.searchable ? (
        <Menu.Search
          ref={inputRef}
          className="upmo-composer__search"
          aria-label={`Filter ${group.label}`}
          aria-activedescendant={activeId}
          placeholder="Filter"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      ) : null}
      {pinned.map(renderItem)}
      {sections.map((section, i) => {
        if (!section.label) return section.entries.map(renderItem);
        const labelId = `${groupId}-section-${i}`;
        return (
          <div key={`${section.label}-${i}`} role="group" aria-labelledby={labelId}>
            <Menu.Label id={labelId}>{section.label}</Menu.Label>
            {section.entries.map(renderItem)}
          </div>
        );
      })}
      {needle && rest.length === 0 ? (
        <div className="upmo-composer__empty" role="status">
          No matches
        </div>
      ) : null}
    </>
  );
}

/**
 * The chat composer: a borderless autosizing textarea over a pill toolbar. The
 * config pill fans out to nested Agent / Route / Model menus; the tools pill
 * picks the tools mode; attach and dictate are icon affordances; the round
 * emerald send sits at the right. Enter sends, Shift+Enter inserts a newline,
 * and send is disabled while the draft is empty. While a reply streams, send
 * turns into Stop (when `onStop` is given) so the user never digs to stop an
 * agent. The whole composer carries one emerald focus ring.
 *
 * Options can carry a `description`, shown under the label, and each group in
 * the config menu shows its current value. A config group can list long
 * options under section labels (`group`), keep some on top (`pinned`) and show
 * a filter field (`searchable`). In a narrow composer (under 420px,
 * or `toolbar="compact"`) the config pill shortens to the model and the toolbar
 * wraps instead of clipping.
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
  toolbar = 'auto',
  hint,
  className,
}: ComposerProps) {
  const baseId = useId();
  const { ref: formRef, width: formWidth } = useElementSize<HTMLFormElement>();
  // Until the first measurement lands the width is 0, and the toolbar is full.
  const compact = toolbar === 'compact' || (toolbar === 'auto' && formWidth > 0 && formWidth < COMPACT_BELOW);
  const empty = value.trim() === '';
  const canSend = !empty && !disabled && !streaming;
  const canStop = Boolean(streaming && onStop);
  const summary = summarise(config);
  const pillText = config ? (compact ? compactLabel(config) : summary) : '';
  const summaryId = `${baseId}-summary`;
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
    <div className={clsx('upmo-composer', compact && 'upmo-composer--compact', className)}>
      <form
        ref={formRef}
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
          <div className="upmo-composer__tools">
            {config ? (
              <Menu position="top-start" withinPortal>
                <Menu.Target>
                  <Button
                    type="button"
                    variant="subtle"
                    size="xs"
                    className="upmo-composer__pill"
                    classNames={pillClassNames}
                    aria-label={`${config.label}: ${pillText}`}
                    aria-describedby={compact ? summaryId : undefined}
                    leftSection={<IconCpu size={14} />}
                    rightSection={<IconChevronDown size={13} />}
                  >
                    <span className="upmo-composer__pill-text">{pillText}</span>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className="upmo-composer__menu">
                  {config.groups.map((group, groupIndex) => {
                    const valueId = `${baseId}-group-${groupIndex}`;
                    return (
                      <Menu.Sub key={group.label} position="right-start">
                        <Menu.Sub.Target>
                          <Menu.Sub.Item aria-label={group.label} aria-describedby={valueId}>
                            <span className="upmo-composer__group">
                              <span>{group.label}</span>
                              <span id={valueId} className="upmo-composer__group-value">
                                {currentLabel(group)}
                              </span>
                            </span>
                          </Menu.Sub.Item>
                        </Menu.Sub.Target>
                        <Menu.Sub.Dropdown className="upmo-composer__menu">
                          <GroupOptions group={group} groupId={`${baseId}-option-${groupIndex}`} />
                        </Menu.Sub.Dropdown>
                      </Menu.Sub>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            ) : null}
            {config && compact ? (
              <span id={summaryId} hidden>
                {summary}
              </span>
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
                    classNames={pillClassNames}
                    aria-label={`Tools mode: ${toolsLabel}`}
                    rightSection={<IconChevronDown size={13} />}
                  >
                    <span className="upmo-composer__pill-text">{toolsLabel}</span>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className="upmo-composer__menu">
                  <Menu.Label>Tools and context</Menu.Label>
                  {toolsMode.options.map((opt, optionIndex) => (
                    <OptionItem
                      key={opt.value}
                      option={opt}
                      checked={opt.value === toolsMode.value}
                      onChange={toolsMode.onChange}
                      descriptionId={`${baseId}-tools-${optionIndex}`}
                    />
                  ))}
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </div>

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
