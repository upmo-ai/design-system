import { useState } from 'react';
import { ActionIcon, SegmentedControl, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import clsx from 'clsx';
import { EmptyState } from '../EmptyState/EmptyState.tsx';

export type ArtifactKind = 'markdown' | 'csv' | 'code' | 'text';

export interface Artifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  /** Pre-formatted size, e.g. "4 KB". */
  size?: string;
  /** Pre-formatted time, e.g. "08:04". */
  time?: string;
  /** The artifact content as text. */
  content: string;
}

export interface ArtifactViewerProps {
  artifacts: Artifact[];
  /** The selected artifact id (uncontrolled fallback is the first). */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Download handler; defaults to a client-side blob download. */
  onDownload?: (artifact: Artifact) => void;
  className?: string;
}

const kindLabel: Record<ArtifactKind, string> = {
  markdown: 'Markdown',
  csv: 'CSV',
  code: 'Code',
  text: 'Text',
};

function downloadBlob(artifact: Artifact) {
  const blob = new Blob([artifact.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = artifact.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A tiny CSV renderer: first non-empty line is the header. No quoted-field handling. */
function CsvTable({ content }: { content: string }) {
  const rows = content
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => l.split(','));
  if (rows.length === 0) return null;
  const [head, ...body] = rows;
  return (
    <Table className="upmo-table">
      <Table.Thead>
        <Table.Tr>
          {head.map((h, i) => (
            <Table.Th key={i}>{h.trim()}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {body.map((r, i) => (
          <Table.Tr key={i}>
            {r.map((c, j) => (
              <Table.Td key={j}>{c.trim()}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/** A minimal markdown renderer: ## headings, - bullet lists, and paragraphs. */
function MarkdownBody({ content }: { content: string }) {
  const blocks = content.split('\n\n');
  return (
    <div className="upmo-artifact__markdown">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return <Title key={i} order={3}>{block.slice(3)}</Title>;
        }
        if (block.split('\n').every((l) => l.startsWith('- '))) {
          return (
            <ul key={i}>
              {block.split('\n').map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}

/**
 * ArtifactViewer presents a task's produced artifacts in a master/detail layout:
 * a tab list of artifacts on the left, and the selected artifact on the right
 * with a header (name, kind, size, time, a Rendered/Source toggle for markdown,
 * and Download) and a typed body (markdown rendered or source, CSV as a table,
 * code and text as a monospace block). With no artifacts it shows an empty state.
 */
export function ArtifactViewer({
  artifacts,
  selectedId,
  onSelect,
  onDownload = downloadBlob,
  className,
}: ArtifactViewerProps) {
  const [internalId, setInternalId] = useState(artifacts[0]?.id);
  const [markdownView, setMarkdownView] = useState<'rendered' | 'source'>('rendered');
  const currentId = selectedId ?? internalId;
  const active = artifacts.find((a) => a.id === currentId) ?? artifacts[0];

  function select(id: string) {
    setInternalId(id);
    onSelect?.(id);
  }

  if (artifacts.length === 0) {
    return (
      <div className={clsx('upmo-artifact', 'upmo-artifact--empty', className)}>
        <EmptyState title="No artifacts yet" description="Results produced by the task will appear here." />
      </div>
    );
  }

  return (
    <div className={clsx('upmo-artifact', className)}>
      <div className="upmo-artifact__list" role="tablist" aria-label="Artifacts">
        {artifacts.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === active.id}
            className={clsx('upmo-artifact__tab', a.id === active.id && 'upmo-artifact__tab--active')}
            onClick={() => select(a.id)}
          >
            <span className="upmo-artifact__tab-name">{a.name}</span>
            <span className="upmo-artifact__tab-meta">
              {[kindLabel[a.kind], a.size, a.time].filter(Boolean).join(' · ')}
            </span>
          </button>
        ))}
      </div>

      <div className="upmo-artifact__view">
        <div className="upmo-artifact__head">
          <div className="upmo-artifact__title">
            <Text fw={600}>{active.name}</Text>
            <Text size="xs" c="dimmed">
              {[kindLabel[active.kind], active.size, active.time].filter(Boolean).join(' · ')}
            </Text>
          </div>
          <div className="upmo-artifact__actions">
            {active.kind === 'markdown' ? (
              <SegmentedControl
                size="xs"
                value={markdownView}
                onChange={(v) => setMarkdownView(v as 'rendered' | 'source')}
                data={[
                  { label: 'Rendered', value: 'rendered' },
                  { label: 'Source', value: 'source' },
                ]}
                aria-label="Markdown view"
              />
            ) : null}
            <Tooltip label="Download" position="bottom" openDelay={400} withinPortal>
              <ActionIcon
                variant="subtle"
                aria-label="Download"
                className="upmo-icon-button"
                onClick={() => onDownload(active)}
              >
                <IconDownload size={16} stroke={1.75} />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        <div className="upmo-artifact__body">
          {active.kind === 'csv' ? (
            <CsvTable content={active.content} />
          ) : active.kind === 'markdown' && markdownView === 'rendered' ? (
            <MarkdownBody content={active.content} />
          ) : (
            <pre className="upmo-artifact__pre">
              <code>{active.content}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
