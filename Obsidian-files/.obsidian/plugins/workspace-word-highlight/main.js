var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WorkspaceWordHighlightPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var MAX_SELECTION_LENGTH = 500;
var DEFAULT_SETTINGS = {
  enabled: true,
  caseSensitive: true,
  wholeWords: true,
  minWordLength: 2,
  maxOccurrencesPerEditor: 1e3,
  debounceMs: 25,
  extraWordCharacters: "",
  highlightActiveOccurrence: true,
  androidSelectionGuard: true
};
var refreshHighlightsEffect = import_state.StateEffect.define();
var WorkspaceWordHighlightPlugin = class extends import_obsidian.Plugin {
  settings = { ...DEFAULT_SETTINGS };
  editorViews = /* @__PURE__ */ new Set();
  currentQuery = null;
  refreshTimer = null;
  pendingRefreshSourceView = null;
  async onload() {
    await this.loadSettings();
    this.registerEditorExtension(this.createEditorExtension());
    this.addSettingTab(new WorkspaceWordHighlightSettingTab(this.app, this));
    this.addCommand({
      id: "toggle-highlighting",
      name: "Toggle highlights",
      callback: async () => {
        this.settings.enabled = !this.settings.enabled;
        await this.saveSettings();
        if (!this.settings.enabled) {
          this.setCurrentQuery(null);
        } else {
          this.recomputeFromActiveMarkdownView();
        }
      }
    });
    this.addCommand({
      id: "clear-highlighting",
      name: "Clear highlights",
      callback: () => this.setCurrentQuery(null)
    });
  }
  onunload() {
    if (this.refreshTimer !== null) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.pendingRefreshSourceView = null;
    this.currentQuery = null;
    this.editorViews.clear();
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
    this.sanitizeSettings();
  }
  async saveSettings() {
    this.sanitizeSettings();
    await this.saveData(this.settings);
  }
  onSettingsChanged() {
    this.sanitizeSettings();
    if (!this.settings.enabled) {
      this.setCurrentQuery(null);
      return;
    }
    if (this.currentQuery) {
      const query = this.currentQuery;
      if (query.origin === "cursor" && query.text.length < this.settings.minWordLength) {
        this.setCurrentQuery(null);
        return;
      }
      this.currentQuery = {
        ...query,
        caseSensitive: this.settings.caseSensitive,
        wholeWord: query.origin === "cursor" && this.settings.wholeWords,
        extraWordCharacters: this.settings.extraWordCharacters,
        maxOccurrencesPerEditor: this.settings.maxOccurrencesPerEditor,
        highlightActiveOccurrence: this.settings.highlightActiveOccurrence
      };
      this.refreshAllEditorViews();
    }
  }
  sanitizeSettings() {
    this.settings.minWordLength = clampInteger(this.settings.minWordLength, 1, 100, 2);
    this.settings.maxOccurrencesPerEditor = clampInteger(
      this.settings.maxOccurrencesPerEditor,
      10,
      1e4,
      1e3
    );
    this.settings.debounceMs = clampInteger(this.settings.debounceMs, 0, 1e3, 25);
    this.settings.extraWordCharacters = String(this.settings.extraWordCharacters ?? "");
  }
  createEditorExtension() {
    const plugin = this;
    const highlightViewPlugin = import_view.ViewPlugin.fromClass(
      class {
        constructor(view) {
          this.view = view;
          plugin.editorViews.add(view);
          this.decorations = plugin.buildDecorations(view);
        }
        decorations;
        deferredAndroidRefresh = false;
        update(update) {
          const explicitRefresh = update.transactions.some(
            (transaction) => transaction.effects.some((effect) => effect.is(refreshHighlightsEffect))
          );
          let sourceQueryChanged = false;
          if (plugin.settings.enabled && update.view.hasFocus && (update.docChanged || update.selectionSet || update.focusChanged)) {
            sourceQueryChanged = plugin.updateQueryFromViewDuringViewUpdate(update.view);
          }
          const needsDecorationRefresh = explicitRefresh || sourceQueryChanged || update.docChanged || update.viewportChanged;
          const protectAndroidSelection = plugin.shouldProtectAndroidSelection(update.view);
          if (protectAndroidSelection && !update.docChanged && !(explicitRefresh && (!plugin.settings.enabled || !plugin.currentQuery))) {
            if (needsDecorationRefresh) this.deferredAndroidRefresh = true;
            return;
          }
          if (needsDecorationRefresh || this.deferredAndroidRefresh) {
            this.decorations = plugin.buildDecorations(update.view);
            this.deferredAndroidRefresh = false;
          }
        }
        destroy() {
          plugin.editorViews.delete(this.view);
          if (plugin.currentQuery?.sourceView === this.view) {
            plugin.currentQuery = null;
            plugin.scheduleRefreshOtherEditorViews(this.view);
          }
        }
      },
      {
        decorations: (value) => value.decorations
      }
    );
    return [highlightViewPlugin];
  }
  shouldProtectAndroidSelection(view) {
    return this.settings.androidSelectionGuard && import_obsidian.Platform.isAndroidApp && !view.state.selection.main.empty;
  }
  /**
   * Update the global query while CodeMirror is already processing the source
   * editor's own transaction. No transaction is dispatched back to that editor.
   * Returns true when the query changed so the caller can rebuild decorations in
   * the same ViewPlugin update.
   */
  updateQueryFromViewDuringViewUpdate(view) {
    const query = this.computeQueryFromView(view);
    if (sameQuery(this.currentQuery, query)) return false;
    this.currentQuery = query;
    this.scheduleRefreshOtherEditorViews(view);
    return true;
  }
  scheduleRefreshOtherEditorViews(sourceView) {
    this.pendingRefreshSourceView = sourceView;
    if (this.refreshTimer !== null) {
      window.clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      const source = this.pendingRefreshSourceView;
      this.pendingRefreshSourceView = null;
      this.refreshAllEditorViews(source ?? void 0);
    }, this.settings.debounceMs);
  }
  computeQueryFromView(view) {
    if (!this.settings.enabled) return null;
    const selection = view.state.selection.main;
    if (!selection.empty) {
      const from = Math.min(selection.from, selection.to);
      const to = Math.max(selection.from, selection.to);
      const selectedText = view.state.sliceDoc(from, to);
      if (!selectedText || selectedText.length > MAX_SELECTION_LENGTH || /\r|\n/.test(selectedText)) {
        return null;
      }
      return {
        text: selectedText,
        origin: "selection",
        sourceView: view,
        sourceFrom: from,
        sourceTo: to,
        caseSensitive: this.settings.caseSensitive,
        wholeWord: false,
        extraWordCharacters: this.settings.extraWordCharacters,
        maxOccurrencesPerEditor: this.settings.maxOccurrencesPerEditor,
        highlightActiveOccurrence: this.settings.highlightActiveOccurrence
      };
    }
    const line = view.state.doc.lineAt(selection.head);
    const word = getWordAtCursor(
      line.text,
      selection.head - line.from,
      this.settings.extraWordCharacters
    );
    if (!word || word.text.length < this.settings.minWordLength) return null;
    return {
      text: word.text,
      origin: "cursor",
      sourceView: view,
      sourceFrom: line.from + word.from,
      sourceTo: line.from + word.to,
      caseSensitive: this.settings.caseSensitive,
      wholeWord: this.settings.wholeWords,
      extraWordCharacters: this.settings.extraWordCharacters,
      maxOccurrencesPerEditor: this.settings.maxOccurrencesPerEditor,
      highlightActiveOccurrence: this.settings.highlightActiveOccurrence
    };
  }
  updateQueryFromView(view) {
    this.setCurrentQuery(this.computeQueryFromView(view));
  }
  setCurrentQuery(query) {
    if (sameQuery(this.currentQuery, query)) return;
    this.currentQuery = query;
    this.refreshAllEditorViews();
  }
  refreshAllEditorViews(except) {
    for (const view of Array.from(this.editorViews)) {
      if (view === except) continue;
      try {
        const scrollTop = view.scrollDOM.scrollTop;
        const scrollLeft = view.scrollDOM.scrollLeft;
        view.dispatch({ effects: refreshHighlightsEffect.of(void 0) });
        if (view.scrollDOM.scrollTop !== scrollTop) {
          view.scrollDOM.scrollTop = scrollTop;
        }
        if (view.scrollDOM.scrollLeft !== scrollLeft) {
          view.scrollDOM.scrollLeft = scrollLeft;
        }
      } catch (error) {
        this.editorViews.delete(view);
        console.warn("Workspace Word Highlight: failed to refresh an editor view", error);
      }
    }
  }
  buildDecorations(view) {
    const query = this.currentQuery;
    if (!this.settings.enabled || !query || !query.text) return import_view.Decoration.none;
    const decorations = [];
    const flags = query.caseSensitive ? "gu" : "giu";
    const matcher = new RegExp(escapeRegExp(query.text), flags);
    let occurrenceCount = 0;
    for (const visibleRange of view.visibleRanges) {
      if (occurrenceCount >= query.maxOccurrencesPerEditor) break;
      const text = view.state.sliceDoc(visibleRange.from, visibleRange.to);
      matcher.lastIndex = 0;
      for (let match = matcher.exec(text); match !== null; match = matcher.exec(text)) {
        if (occurrenceCount >= query.maxOccurrencesPerEditor) break;
        if (match[0].length === 0) {
          matcher.lastIndex += 1;
          continue;
        }
        const from = visibleRange.from + match.index;
        const to = from + match[0].length;
        if (query.wholeWord && !hasWholeWordBoundaries(view, from, to, query.extraWordCharacters)) {
          continue;
        }
        const isActiveOccurrence = query.highlightActiveOccurrence && view === query.sourceView && from === query.sourceFrom && to === query.sourceTo;
        const className = isActiveOccurrence ? "workspace-word-highlight workspace-word-highlight-active" : "workspace-word-highlight";
        decorations.push(import_view.Decoration.mark({ class: className }).range(from, to));
        occurrenceCount += 1;
      }
    }
    return import_view.Decoration.set(decorations, true);
  }
  recomputeFromActiveMarkdownView() {
    const markdownView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!markdownView) {
      this.refreshAllEditorViews();
      return;
    }
    const cm = markdownView.editor.cm;
    if (cm) this.updateQueryFromView(cm);
  }
};
var WorkspaceWordHighlightSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Enable highlighting").setDesc("Highlight the current word or selection in every open Markdown editor pane.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
        this.plugin.settings.enabled = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Case sensitive").setDesc("Treat Foo and foo as different text.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.caseSensitive).onChange(async (value) => {
        this.plugin.settings.caseSensitive = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Whole words").setDesc("For cursor-based highlighting, do not match the word inside a longer word. Selections are always matched literally.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.wholeWords).onChange(async (value) => {
        this.plugin.settings.wholeWords = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Minimum word length").setDesc("Cursor words shorter than this are ignored. Selections are not affected.").addText(
      (text) => text.setPlaceholder("2").setValue(String(this.plugin.settings.minWordLength)).onChange(async (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) this.plugin.settings.minWordLength = parsed;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Additional word characters").setDesc("Characters to consider part of a cursor word in addition to Unicode letters, digits, and underscore. Example: -.$").addText(
      (text) => text.setPlaceholder("-.$").setValue(this.plugin.settings.extraWordCharacters).onChange(async (value) => {
        this.plugin.settings.extraWordCharacters = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Highlight active occurrence").setDesc("Use a separate CSS class for the occurrence that contains the active cursor or selection.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.highlightActiveOccurrence).onChange(async (value) => {
        this.plugin.settings.highlightActiveOccurrence = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Protect Android text selection").setDesc(
      "Avoid rebuilding highlight spans in an editor while Android text selection handles are active. This improves selection and Copy stability; selected text can still be highlighted in other panes."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.androidSelectionGuard).onChange(async (value) => {
        this.plugin.settings.androidSelectionGuard = value;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Debounce (ms)").setDesc("Delay before propagating a new cursor word to the other panes. The active pane updates inside its normal editor transaction. 0 is immediate; 15\u201340 ms is usually smoother.").addText(
      (text) => text.setPlaceholder("25").setValue(String(this.plugin.settings.debounceMs)).onChange(async (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) this.plugin.settings.debounceMs = parsed;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Maximum matches per editor").setDesc("Safety limit for a single pane. Only visible text is scanned.").addText(
      (text) => text.setPlaceholder("1000").setValue(String(this.plugin.settings.maxOccurrencesPerEditor)).onChange(async (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) this.plugin.settings.maxOccurrencesPerEditor = parsed;
        await this.plugin.saveSettings();
        this.plugin.onSettingsChanged();
      })
    );
  }
};
function clampInteger(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}
function sameQuery(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.text === b.text && a.origin === b.origin && a.sourceView === b.sourceView && a.sourceFrom === b.sourceFrom && a.sourceTo === b.sourceTo && a.caseSensitive === b.caseSensitive && a.wholeWord === b.wholeWord && a.extraWordCharacters === b.extraWordCharacters && a.maxOccurrencesPerEditor === b.maxOccurrencesPerEditor && a.highlightActiveOccurrence === b.highlightActiveOccurrence;
}
function getWordAtCursor(lineText, cursorOffset, extraWordCharacters) {
  const matcher = new RegExp(`[\\p{L}\\p{N}_${escapeForCharacterClass(extraWordCharacters)}]+`, "gu");
  const matches = Array.from(lineText.matchAll(matcher));
  for (const match of matches) {
    const from = match.index ?? 0;
    const to = from + match[0].length;
    if (cursorOffset >= from && cursorOffset < to) {
      return { from, to, text: match[0] };
    }
  }
  return null;
}
function hasWholeWordBoundaries(view, from, to, extraWordCharacters) {
  const previous = getCodePointBefore(view, from);
  const next = getCodePointAt(view, to);
  return !isWordCharacter(previous, extraWordCharacters) && !isWordCharacter(next, extraWordCharacters);
}
function getCodePointBefore(view, position) {
  if (position <= 0) return "";
  const start = Math.max(0, position - 2);
  const text = view.state.sliceDoc(start, position);
  const chars = Array.from(text);
  return chars.at(-1) ?? "";
}
function getCodePointAt(view, position) {
  if (position >= view.state.doc.length) return "";
  const end = Math.min(view.state.doc.length, position + 2);
  const text = view.state.sliceDoc(position, end);
  return Array.from(text)[0] ?? "";
}
function isWordCharacter(character, extraWordCharacters) {
  if (!character) return false;
  if (/^[\p{L}\p{N}_]$/u.test(character)) return true;
  return extraWordCharacters.includes(character);
}
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeForCharacterClass(text) {
  return text.replace(/[\\\]\-^]/g, "\\$&");
}

/* nosourcemap */