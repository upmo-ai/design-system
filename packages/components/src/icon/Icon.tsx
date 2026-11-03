import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArchive,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconArrowsSort,
  IconBell,
  IconBook,
  IconBooks,
  IconBraces,
  IconBrain,
  IconCalendar,
  IconCalendarClock,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClock,
  IconClockPlay,
  IconCode,
  IconCoins,
  IconCommand,
  IconCopy,
  IconCornerDownRight,
  IconCpu,
  IconDatabase,
  IconDots,
  IconDotsVertical,
  IconDownload,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconFile,
  IconFileCode,
  IconFileSearch,
  IconFileText,
  IconFileTypePdf,
  IconFilter,
  IconFolder,
  IconGitBranch,
  IconGripVertical,
  IconHelp,
  IconHome,
  IconInfoCircle,
  IconKey,
  IconKeyboard,
  IconLayoutSidebar,
  IconLink,
  IconListCheck,
  IconLoader2,
  IconLock,
  IconLockOpen,
  IconLogin,
  IconLogout,
  IconMail,
  IconMenu2,
  IconMessage,
  IconMicrophone,
  IconMoon,
  IconPaperclip,
  IconPencil,
  IconPhoto,
  IconPin,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlug,
  IconPlugConnected,
  IconPlugX,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconSend,
  IconServer,
  IconSettings,
  IconShare,
  IconShieldCheck,
  IconSquare,
  IconSun,
  IconTag,
  IconTerminal2,
  IconTool,
  IconTrash,
  IconUpload,
  IconUser,
  IconUserHexagon,
  IconUsers,
  IconWallet,
  IconWifi,
  IconWifiOff,
  IconX,
  type IconProps as TablerIconProps,
} from '@tabler/icons-react';
import { icons, stroke, type IconConcept } from '@upmo-ai/icons';
import type { FC } from 'react';
import { Caret } from '../status/Caret.tsx';

export type { IconConcept };

// The concept map resolves a concept to a glyph NAME; this table resolves the
// Tabler names our map uses to their components. Generated to match icons.json;
// if a concept points at a name missing here, Icon renders nothing rather than
// guessing. The caret is handled separately (it is Upmo's own live mark).
const byName: Record<string, FC<TablerIconProps>> = {
  'alert-circle': IconAlertCircle,
  'alert-triangle': IconAlertTriangle,
  archive: IconArchive,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  'arrow-up': IconArrowUp,
  'arrows-sort': IconArrowsSort,
  bell: IconBell,
  book: IconBook,
  books: IconBooks,
  braces: IconBraces,
  brain: IconBrain,
  calendar: IconCalendar,
  'calendar-clock': IconCalendarClock,
  'chart-bar': IconChartBar,
  check: IconCheck,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'chevron-up': IconChevronUp,
  clock: IconClock,
  'clock-play': IconClockPlay,
  code: IconCode,
  coins: IconCoins,
  command: IconCommand,
  copy: IconCopy,
  'corner-down-right': IconCornerDownRight,
  cpu: IconCpu,
  database: IconDatabase,
  dots: IconDots,
  'dots-vertical': IconDotsVertical,
  download: IconDownload,
  'external-link': IconExternalLink,
  eye: IconEye,
  'eye-off': IconEyeOff,
  file: IconFile,
  'file-code': IconFileCode,
  'file-search': IconFileSearch,
  'file-text': IconFileText,
  'file-type-pdf': IconFileTypePdf,
  filter: IconFilter,
  folder: IconFolder,
  'git-branch': IconGitBranch,
  'grip-vertical': IconGripVertical,
  help: IconHelp,
  home: IconHome,
  'info-circle': IconInfoCircle,
  key: IconKey,
  keyboard: IconKeyboard,
  'layout-sidebar': IconLayoutSidebar,
  link: IconLink,
  'list-check': IconListCheck,
  'loader-2': IconLoader2,
  lock: IconLock,
  'lock-open': IconLockOpen,
  login: IconLogin,
  logout: IconLogout,
  mail: IconMail,
  'menu-2': IconMenu2,
  message: IconMessage,
  microphone: IconMicrophone,
  moon: IconMoon,
  paperclip: IconPaperclip,
  pencil: IconPencil,
  photo: IconPhoto,
  pin: IconPin,
  'player-pause': IconPlayerPause,
  'player-play': IconPlayerPlay,
  'player-stop': IconPlayerStop,
  plug: IconPlug,
  'plug-connected': IconPlugConnected,
  'plug-x': IconPlugX,
  plus: IconPlus,
  receipt: IconReceipt,
  refresh: IconRefresh,
  search: IconSearch,
  send: IconSend,
  server: IconServer,
  settings: IconSettings,
  share: IconShare,
  'shield-check': IconShieldCheck,
  square: IconSquare,
  sun: IconSun,
  tag: IconTag,
  'terminal-2': IconTerminal2,
  tool: IconTool,
  trash: IconTrash,
  upload: IconUpload,
  user: IconUser,
  'user-hexagon': IconUserHexagon,
  users: IconUsers,
  wallet: IconWallet,
  wifi: IconWifi,
  'wifi-off': IconWifiOff,
  x: IconX,
};

export interface IconProps {
  /** The concept to render (e.g. "nav.tasks", "action.send"). */
  concept: IconConcept;
  /** Pixel size. Default 18. */
  size?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * Icon resolves an Upmo icon concept to its glyph. The concept map
 * (@upmo-ai/icons) is the single source of truth: a concept resolves to a
 * Tabler glyph name, or to the caret (Upmo's own live mark), which renders the
 * Caret component. A concept whose glyph is not in the table renders nothing,
 * never a guess. Decorative by default; pass aria-label for a meaningful icon.
 */
export function Icon({ concept, size = 18, className, 'aria-label': ariaLabel }: IconProps) {
  const name = icons[concept];

  if (name === 'caret') {
    return <Caret mark="caret-live" size={size} className={className} />;
  }

  const Glyph = byName[name];
  if (!Glyph) return null;

  return (
    <Glyph
      size={size}
      stroke={stroke}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
