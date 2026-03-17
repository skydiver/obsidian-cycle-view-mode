import { type IconName, MarkdownView, Plugin, setIcon } from 'obsidian';

type ViewMode = 'reading' | 'live-preview' | 'source';

const MODE_CYCLE: ViewMode[] = ['reading', 'live-preview', 'source'];

const MODE_ICON: Record<ViewMode, IconName> = {
  reading: 'book-open',
  'live-preview': 'edit-3',
  source: 'code-2',
};

export default class CycleViewMode extends Plugin {
  private statusBarEl!: HTMLElement;
  private lastMode: ViewMode | null = null;

  async onload() {
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass('mod-clickable');
    this.registerDomEvent(this.statusBarEl, 'click', () => {
      this.cycleMode();
    });

    this.addCommand({
      id: 'cycle-view-mode',
      name: 'Cycle view mode',
      callback: () => {
        this.cycleMode();
      },
    });

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateStatusBar();
      })
    );

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.updateStatusBar();
      })
    );

    this.updateStatusBar();
  }

  private getCurrentMode(view: MarkdownView): ViewMode {
    const mode = view.getMode();
    if (mode === 'preview') return 'reading';
    const state = view.getState();
    return state.source ? 'source' : 'live-preview';
  }

  private async cycleMode(): Promise<void> {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    const current = this.getCurrentMode(view);
    const currentIndex = MODE_CYCLE.indexOf(current);
    const next = MODE_CYCLE[(currentIndex + 1) % MODE_CYCLE.length];

    const leaf = view.leaf;
    const currentState = leaf.getViewState();

    await leaf.setViewState({
      ...currentState,
      state: {
        ...currentState.state,
        mode: next === 'reading' ? 'preview' : 'source',
        source: next === 'source',
      },
    });

    this.updateStatusBar();
  }

  private updateStatusBar(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.statusBarEl.empty();
      this.lastMode = null;
      return;
    }

    const current = this.getCurrentMode(view);
    if (current === this.lastMode) return;

    this.lastMode = current;
    this.statusBarEl.empty();
    setIcon(this.statusBarEl, MODE_ICON[current]);
  }
}
