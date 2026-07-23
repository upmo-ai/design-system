// The Upmo status / liveness model. Two distinct enums that share one tone
// layer. Phase is the low-level task progress; Attention is the high-level hint
// to the user. The two can co-occur on one run (e.g. Working + Needs approval).
//
// Every state carries a WORD and a TONE, so colour is never the sole signal.
// Active states (Working, Checking) use the live caret draw-sweep; terminal and
// discrete states use a familiar icon. See status.tsx for the rendering.

/** The shared tone layer. Drives colour and ground across both enums. */
export type Tone = 'neutral' | 'active' | 'positive' | 'attention' | 'critical';

/** Phase: the lifecycle a task moves through. Mostly automatic, linear. */
export type Phase = 'Preparing' | 'Planning' | 'Working' | 'Checking' | 'Done' | 'Failed';

/** Attention: what the run wants from the user, or what happened to it. */
export type Attention = 'Queued' | 'Needs approval' | 'Paused' | 'Stopped';

/** Any status word across both enums. */
export type Status = Phase | Attention;

/** How a state draws its mark: the live caret, a static caret, or an icon. */
export type Mark = 'caret-live' | 'caret-partial' | 'caret-undrawn' | 'icon';

export interface StatusMeta {
  tone: Tone;
  mark: Mark;
  /** The icon concept for icon-marked states (maps to a Tabler icon). */
  icon?: 'check' | 'x' | 'clock' | 'shield' | 'pause' | 'stop';
}

export const phaseMeta: Record<Phase, StatusMeta> = {
  Preparing: { tone: 'neutral', mark: 'caret-undrawn' },
  Planning: { tone: 'neutral', mark: 'caret-partial' },
  Working: { tone: 'active', mark: 'caret-live' },
  Checking: { tone: 'active', mark: 'caret-live' },
  Done: { tone: 'positive', mark: 'icon', icon: 'check' },
  Failed: { tone: 'critical', mark: 'icon', icon: 'x' },
};

export const attentionMeta: Record<Attention, StatusMeta> = {
  Queued: { tone: 'neutral', mark: 'icon', icon: 'clock' },
  'Needs approval': { tone: 'attention', mark: 'icon', icon: 'shield' },
  Paused: { tone: 'neutral', mark: 'icon', icon: 'pause' },
  Stopped: { tone: 'critical', mark: 'icon', icon: 'stop' },
};

const allMeta: Record<string, StatusMeta> = { ...phaseMeta, ...attentionMeta };

export function statusMeta(status: Status): StatusMeta {
  const meta = allMeta[status];
  if (!meta) throw new Error(`Unknown status: ${status}`);
  return meta;
}

export const phases = Object.keys(phaseMeta) as Phase[];
export const attentions = Object.keys(attentionMeta) as Attention[];
