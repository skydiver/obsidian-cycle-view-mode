import { type IconName, MarkdownView, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian';

type ViewMode = 'reading' | 'live-preview' | 'source';

interface CycleViewModeSettings {
  hideNativeIndicator: boolean;
  replaceNativeIndicator: boolean;
}

const DEFAULT_SETTINGS: CycleViewModeSettings = {
  hideNativeIndicator: true,
  replaceNativeIndicator: true,
};

const NATIVE_SELECTOR = '.status-bar-item.plugin-editor-status';

const MODE_CYCLE: ViewMode[] = ['reading', 'live-preview', 'source'];

const MODE_ICON: Record<ViewMode, IconName> = {
  reading: 'book-open',
  'live-preview': 'edit-3',
  source: 'code-2',
};

const BODY_CLASS = 'cycle-view-mode-hide-native';

export default class CycleViewMode extends Plugin {
  settings!: CycleViewModeSettings;
  private statusBarEl!: HTMLElement;
  private lastMode: ViewMode | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CycleViewModeSettingTab(this));
    this.applyBodyClass();

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass('mod-clickable');
    this.registerDomEvent(this.statusBarEl, 'click', () => {
      this.cycleMode();
    });

    this.repositionStatusBarItem();

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

  onunload() {
    document.body.removeClass(BODY_CLASS);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyBodyClass();
    this.repositionStatusBarItem();
  }

  applyBodyClass() {
    document.body.toggleClass(BODY_CLASS, this.settings.hideNativeIndicator);
  }

  repositionStatusBarItem() {
    if (!this.settings.replaceNativeIndicator) return;

    const nativeEl = document.querySelector(NATIVE_SELECTOR);
    if (nativeEl) {
      nativeEl.after(this.statusBarEl);
    }
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

class CycleViewModeSettingTab extends PluginSettingTab {
  private plugin: CycleViewMode;

  constructor(plugin: CycleViewMode) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName('Hide native view mode indicator')
      .setDesc("Hide Obsidian's built-in view mode status bar item.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.hideNativeIndicator).onChange(async (value) => {
          this.plugin.settings.hideNativeIndicator = value;
          await this.plugin.saveSettings();
        });
      });

    const positionSetting = new Setting(this.containerEl)
      .setName('Replace native indicator position')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.replaceNativeIndicator).onChange(async (value) => {
          this.plugin.settings.replaceNativeIndicator = value;
          await this.plugin.saveSettings();
          updatePositionDesc();
        });
      });

    const updatePositionDesc = () => {
      const frag = document.createDocumentFragment();
      frag.appendText('Place the cycling icon where the native view mode indicator is.');
      if (!this.plugin.settings.replaceNativeIndicator) {
        frag.createEl('br');
        frag.appendText('Reload required to restore original position.');
      }
      positionSetting.setDesc(frag);
    };
    updatePositionDesc();
  }
}
