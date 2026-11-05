import { IconFolder } from '@tabler/icons-react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Breadcrumbs,
  CodeBlock,
  CopyButton,
  EmptyState,
  JsonBlock,
  Menu,
  Panel,
  Table,
} from '../src/index.ts';
import { renderThemed, themes } from './render.tsx';

describe('Panel', () => {
  it('renders bordered content', () => {
    renderThemed(<Panel>Panel body</Panel>);
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description, icon tile and a single action', () => {
    renderThemed(
      <EmptyState
        icon={<IconFolder />}
        title="No connectors yet"
        description="Connect a tool to let agents act."
        action={<button type="button">Connect</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No connectors yet' })).toBeInTheDocument();
    expect(screen.getByText('Connect a tool to let agents act.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
  });

  it('draws the first-run border', () => {
    const { container } = renderThemed(<EmptyState title="Start here" firstRun />);
    expect(container.querySelector('.upmo-empty-state--first-run')).toBeTruthy();
  });

  it('renders the title at headingLevel with an unchanged look', () => {
    const { rerender } = renderThemed(<EmptyState title="Empty" />);
    const h3 = screen.getByRole('heading', { level: 3, name: 'Empty' });
    rerender(<EmptyState title="Empty" headingLevel={5} />);
    const h5 = screen.getByRole('heading', { level: 5, name: 'Empty' });
    expect(h5.style.getPropertyValue('--title-fz')).toBe(h3.style.getPropertyValue('--title-fz'));
    expect(h5.style.getPropertyValue('--title-lh')).toBe(h3.style.getPropertyValue('--title-lh'));
  });

  it('compact drops the large padding, shrinks the icon tile and lifts the description cap', () => {
    const measure = (container: HTMLElement) => {
      const root = container.querySelector('.upmo-empty-state') as HTMLElement;
      const tile = container.querySelector('.mantine-ThemeIcon-root') as HTMLElement;
      return {
        compactClass: root.classList.contains('upmo-empty-state--compact'),
        // Mantine writes the padding style props inline on the root.
        inlinePadding: /padding-(block|inline|top|bottom|left|right)/.test(root.getAttribute('style') ?? ''),
        tile: tile.style.getPropertyValue('--ti-size'),
        descriptionMax: screen.getByText('Nothing here.').style.maxWidth,
        titleSize: screen.getByRole('heading').style.getPropertyValue('--title-fz'),
      };
    };

    const regularRender = renderThemed(<EmptyState icon={<IconFolder />} title="Empty" description="Nothing here." />);
    const regular = measure(regularRender.container);
    regularRender.unmount();

    const compactRender = renderThemed(<EmptyState compact icon={<IconFolder />} title="Empty" description="Nothing here." />);
    const compact = measure(compactRender.container);

    expect(regular.compactClass).toBe(false);
    expect(regular.inlinePadding).toBe(true);
    expect(regular.tile).toContain('3rem');
    expect(regular.descriptionMax).not.toBe('');

    expect(compact.compactClass).toBe(true);
    expect(compact.inlinePadding).toBe(false);
    expect(compact.tile).toContain('2rem');
    expect(compact.descriptionMax).toBe('');
    expect(compact.titleSize).not.toBe(regular.titleSize);
  });

  it('renders in all three themes', () => {
    for (const theme of themes) {
      const { unmount } = renderThemed(<EmptyState title="Empty" />, theme);
      expect(screen.getByRole('heading', { name: 'Empty' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('CopyButton', () => {
  it('copies the value and confirms with a copied label', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderThemed(<CopyButton value="sk-123" />);
    const btn = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith('sk-123');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument());
  });
});

describe('CodeBlock and JsonBlock', () => {
  it('CodeBlock shows the code (highlighted) and a language label', () => {
    const { container } = renderThemed(<CodeBlock code="docker compose up -d" language="bash" />);
    // Highlighting splits the code into token spans, so assert on the combined
    // textContent of the <code> element rather than a single text node.
    expect(container.querySelector('.upmo-codeblock__code')?.textContent).toContain(
      'docker compose up -d',
    );
    expect(screen.getByText('bash')).toBeInTheDocument();
    // Tokens are rendered as spans with inline colour styles.
    expect(container.querySelectorAll('.upmo-codeblock__line').length).toBeGreaterThan(0);
  });

  it('CodeBlock renders a line-number gutter when asked', () => {
    const { container } = renderThemed(
      <CodeBlock code={'const a = 1;\nconst b = 2;'} language="tsx" lineNumbers />,
    );
    const nums = container.querySelectorAll('.upmo-codeblock__ln');
    expect(nums.length).toBe(2);
    expect(nums[0].textContent).toBe('1');
    expect(nums[1].textContent).toBe('2');
  });

  it('JsonBlock pretty-prints a value', () => {
    const { container } = renderThemed(<JsonBlock value={{ a: 1 }} />);
    expect(container.querySelector('code')?.textContent).toContain('"a": 1');
  });
});

describe('Breadcrumbs', () => {
  it('renders links for interior crumbs and marks the current page', () => {
    renderThemed(
      <Breadcrumbs
        items={[
          { label: 'Workspace', href: '/' },
          { label: 'Connectors', href: '/connectors' },
          { label: 'GitHub' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Workspace' })).toBeInTheDocument();
    const current = screen.getByText('GitHub');
    expect(current).toHaveAttribute('aria-current', 'page');
  });
});

describe('Menu', () => {
  it('opens and shows items on trigger', async () => {
    renderThemed(
      <Menu>
        <Menu.Target>
          <button type="button">Open</button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item color="red">Sign out</Menu.Item>
        </Menu.Dropdown>
      </Menu>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});

describe('Table', () => {
  it('renders a dense table with num and mono cells', () => {
    renderThemed(
      <Table aria-label="Runs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Run</Table.Th>
            <Table.Th>Id</Table.Th>
            <Table.Th>Cost</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Invoice sync</Table.Td>
            <Table.Mono>run_abc</Table.Mono>
            <Table.Num>$0.21</Table.Num>
          </Table.Tr>
        </Table.Tbody>
      </Table>,
    );
    expect(screen.getByRole('table', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.getByText('run_abc').className).toContain('upmo-table__mono');
    expect(screen.getByText('$0.21').className).toContain('upmo-table__num');
  });
});
