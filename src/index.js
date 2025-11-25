/**
 * @typedef {{
 *   element: HTMLDivElement,
 *   content: HTMLDivElement,
 *   title: HTMLDivElement,
 *   color: string
 * }} NoteData
 */

/**
 * @typedef {{
 *   x?: number,
 *   y?: number,
 *   color?: string,
 *   text?: string,
 *   title?: string,
 *   collapsed?: boolean
 * }} NoteInfo
 */

/**
 * Sticky Notes Library
 * A lightweight, vanilla JavaScript library for creating draggable, editable
 * sticky notes.
 */
class StickyNote {
  /**
   * @param {{
   *   container?: HTMLElement,
   *   colors?: string[],
   *   defaultColor?: string
   * }} [options]
   */
  constructor (options = {}) {
    this.container = options.container || document.body;
    /** @type {NoteData[]} */
    this.notes = [];
    this.draggedNote = null;
    this.offset = {x: 0, y: 0};
    this.colors = options.colors ||
      ['#fff740', '#ff7eb9', '#7afcff', '#feff9c', '#a7ffeb'];
    this.defaultColor = options.defaultColor || this.colors[0];

    this.init();
  }

  /**
   * @returns {void}
   */
  init () {
    // Add base styles
    this.injectStyles();

    // Bind events
    document.addEventListener('mousemove', this.handleDrag.bind(this));
    document.addEventListener('mouseup', this.handleDragEnd.bind(this));
  }

  /**
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this -- Convenient
  injectStyles () {
    if (document.querySelector('#sticky-notes-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'sticky-notes-styles';
    style.textContent = `
      .sticky-note {
        position: absolute;
        width: 200px;
        min-height: 150px;
        padding: 10px;
        background: #fff740;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 14px;
        cursor: move;
        user-select: none;
        z-index: 1;
      }

      .sticky-note.dragging {
        opacity: 0.8;
        z-index: 1000;
      }

      .sticky-note.collapsed {
        min-height: auto;
      }

      .sticky-note.collapsed .sticky-note-controls {
        display: none;
      }

      .sticky-note.collapsed .sticky-note-content {
        display: none;
      }

      .sticky-note-content {
        outline: none;
        min-height: 100px;
        cursor: text;
        word-wrap: break-word;
        user-select: text;
      }

      .sticky-note-title {
        outline: none;
        font-weight: bold;
        font-size: 13px;
        padding: 2px 4px;
        border-radius: 2px;
        user-select: none;
        min-height: 0;
        display: none;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sticky-note-title.has-content {
        display: block;
      }

      .sticky-note-title.editing {
        cursor: text;
        user-select: text;
        background: rgba(255, 255, 255, 0.3);
        white-space: normal;
      }

      .sticky-note-title.editing:empty:before {
        content: 'Enter title...';
        color: rgba(0, 0, 0, 0.3);
        font-weight: normal;
        font-style: italic;
      }

      .sticky-note-header {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 5px;
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      .sticky-note.collapsed .sticky-note-header {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 0;
        min-height: 20px;
        cursor: pointer;
      }

      .sticky-note-controls {
        display: flex;
        justify-content: flex-end;
        gap: 5px;
      }

      .sticky-note-btn {
        background: rgba(0, 0, 0, 0.1);
        border: none;
        border-radius: 3px;
        padding: 3px 8px;
        cursor: pointer;
        font-size: 12px;
      }

      .sticky-note-btn:hover {
        background: rgba(0, 0, 0, 0.2);
      }

      .sticky-note-confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .sticky-note-confirm-dialog {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        min-width: 300px;
        font-family: Arial, sans-serif;
      }

      .sticky-note-confirm-message {
        margin-bottom: 20px;
        font-size: 14px;
        color: #333;
      }

      .sticky-note-confirm-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .sticky-note-confirm-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .sticky-note-confirm-btn-yes {
        background: #dc3545;
        color: white;
      }

      .sticky-note-confirm-btn-yes:hover {
        background: #c82333;
      }

      .sticky-note-confirm-btn-no {
        background: #6c757d;
        color: white;
      }

      .sticky-note-confirm-btn-no:hover {
        background: #5a6268;
      }
    `;
    document.head.append(style);
  }

  /**
   * @param {NoteInfo} [options]
   * @returns {NoteData}
   */
  createNote (options = {}) {
    const note = document.createElement('div');
    note.className = 'sticky-note';

    // eslint-disable-next-line sonarjs/pseudo-random -- Safe
    const x = options.x || Math.random() * (window.innerWidth - 250);
    // eslint-disable-next-line sonarjs/pseudo-random -- Safe
    const y = options.y || Math.random() * (window.innerHeight - 200);
    const color = options.color || this.defaultColor;
    const text = options.text || '';
    const title = options.title || '';
    const collapsed = options.collapsed || false;

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.background = color;

    // Store color index for cycling
    const colorIndex = this.colors.indexOf(color);
    note.dataset.colorIndex = colorIndex !== -1 ? colorIndex.toString() : '0';

    // Create title
    const titleElement = document.createElement('div');
    titleElement.className = 'sticky-note-title';
    titleElement.contentEditable = 'false';
    titleElement.textContent = title;
    if (title) {
      titleElement.classList.add('has-content');
    }

    // Double-click title to toggle collapse (when not editing)
    titleElement.addEventListener('dblclick', (e) => {
      if (!titleElement.classList.contains('editing')) {
        e.stopPropagation();
        note.classList.toggle('collapsed');
      }
    });

    // Prevent drag only when editing title
    titleElement.addEventListener('mousedown', (e) => {
      if (titleElement.classList.contains('editing')) {
        e.stopPropagation();
      }
    });

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'sticky-note-controls';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'sticky-note-btn';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete note';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showConfirm('Delete this note?', () => {
        this.deleteNote(note);
      });
    });

    const colorBtn = document.createElement('button');
    colorBtn.className = 'sticky-note-btn';
    colorBtn.textContent = '🎨';
    colorBtn.title = 'Change color';
    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cycleColor(note);
    });

    const editTitleBtn = document.createElement('button');
    editTitleBtn.className = 'sticky-note-btn';
    editTitleBtn.textContent = '✏️';
    editTitleBtn.title = 'Edit title';
    editTitleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTitleEdit(titleElement);
    });

    controls.append(editTitleBtn);
    controls.append(colorBtn);
    controls.append(deleteBtn);

    // Create content area
    const content = document.createElement('div');
    content.className = 'sticky-note-content';
    content.contentEditable = 'true';
    content.textContent = text;

    // Prevent drag when editing
    content.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      // Exit title edit mode when clicking into content area
      if (titleElement.classList.contains('editing')) {
        this.toggleTitleEdit(titleElement);
      }
    });

    // Handle drag start on note header
    note.addEventListener('mousedown', (e) => {
      if (e.target === content || content.contains(/** @type {Node} */ (
        e.target
      ))) {
        return;
      }
      if (e.target === titleElement &&
        titleElement.classList.contains('editing')) {
        return;
      }
      this.handleDragStart(e, note);
    });

    // Bring to front on click
    note.addEventListener('mousedown', () => {
      this.bringToFront(note);
    });

    // Create header wrapper for title and controls
    const header = document.createElement('div');
    header.className = 'sticky-note-header';

    // Double-click header to collapse/expand (when not clicking on editable
    //   title or buttons)
    header.addEventListener('dblclick', (e) => {
      if (e.target === titleElement &&
        titleElement.classList.contains('editing')) {
        return;
      }
      if (/** @type {HTMLElement} */ (
        e.target
      ).classList.contains('sticky-note-btn')) {
        return;
      }
      e.stopPropagation();
      note.classList.toggle('collapsed');
    });

    header.append(titleElement);
    header.append(controls);

    note.append(header);
    note.append(content);
    this.container.append(note);

    // Apply collapsed state if specified
    if (collapsed) {
      note.classList.add('collapsed');
    }

    const noteData = {
      element: note,
      content,
      title: titleElement,
      color
    };

    this.notes.push(noteData);
    return noteData;
  }

  /**
   * @param {MouseEvent} e
   * @param {HTMLDivElement} note
   * @returns {void}
   */
  handleDragStart (e, note) {
    this.draggedNote = note;
    this.offset.x = e.clientX - note.offsetLeft;
    this.offset.y = e.clientY - note.offsetTop;
    note.classList.add('dragging');
  }

  /**
   * @param {MouseEvent} e
   * @returns {void}
   */
  handleDrag (e) {
    if (!this.draggedNote) {
      return;
    }

    const x = e.clientX - this.offset.x;
    const y = e.clientY - this.offset.y;

    this.draggedNote.style.left = `${x}px`;
    this.draggedNote.style.top = `${y}px`;
  }

  /**
   * @returns {void}
   */
  handleDragEnd () {
    if (this.draggedNote) {
      this.draggedNote.classList.remove('dragging');
      this.draggedNote = null;
    }
  }

  /**
   * @param {HTMLDivElement} note
   * @returns {void}
   */
  cycleColor (note) {
    // Store current color index as data attribute
    let currentIndex = Number.parseInt(note.dataset.colorIndex || '0');
    currentIndex = (currentIndex + 1) % this.colors.length;
    note.style.background = this.colors[currentIndex];
    note.dataset.colorIndex = currentIndex.toString();
  }

  /**
   * @param {HTMLElement} titleElement
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this -- Convenient
  toggleTitleEdit (titleElement) {
    const isEditing = titleElement.classList.contains('editing');

    if (isEditing) {
      // Exit edit mode
      titleElement.classList.remove('editing');
      titleElement.contentEditable = 'false';
      titleElement.blur();

      // Show/hide title based on content
      if (titleElement.textContent.trim()) {
        titleElement.classList.add('has-content');
      } else {
        titleElement.classList.remove('has-content');
        titleElement.textContent = '';
      }
    } else {
      // Enter edit mode
      titleElement.classList.add('editing', 'has-content');
      titleElement.contentEditable = 'true';
      titleElement.focus();

      // Select all text
      const range = document.createRange();
      range.selectNodeContents(titleElement);
      const selection = globalThis.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  /**
   * @param {HTMLDivElement} note
   * @returns {void}
   */
  bringToFront (note) {
    const maxZ = Math.max(...this.notes.map((n) => Number.parseInt(
      n.element.style.zIndex || '1'
    )));
    note.style.zIndex = String(maxZ + 1);
  }

  /**
   * @param {string} message
   * @param {() => void} onConfirm
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this -- Convenient
  showConfirm (message, onConfirm) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sticky-note-confirm-overlay';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'sticky-note-confirm-dialog';

    // Create message
    const messageEl = document.createElement('div');
    messageEl.className = 'sticky-note-confirm-message';
    messageEl.textContent = message;

    // Create buttons container
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'sticky-note-confirm-buttons';

    // Create No button
    const noBtn = document.createElement('button');
    noBtn.className = 'sticky-note-confirm-btn sticky-note-confirm-btn-no';
    noBtn.textContent = 'Cancel';
    noBtn.addEventListener('click', () => {
      overlay.remove();
    });

    // Create Yes button
    const yesBtn = document.createElement('button');
    yesBtn.className = 'sticky-note-confirm-btn sticky-note-confirm-btn-yes';
    yesBtn.textContent = 'Delete';
    yesBtn.addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });

    buttonsEl.append(noBtn);
    buttonsEl.append(yesBtn);

    dialog.append(messageEl);
    dialog.append(buttonsEl);
    overlay.append(dialog);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.append(overlay);

    // Focus yes button
    yesBtn.focus();
  }

  /**
   * @param {HTMLDivElement} noteElement
   * @returns {void}
   */
  deleteNote (noteElement) {
    const index = this.notes.findIndex((n) => n.element === noteElement);
    if (index !== -1) {
      this.notes[index].element.remove();
      this.notes.splice(index, 1);
    }
  }

  /**
   * @returns {Required<NoteInfo[]>}
   */
  getAllNotes () {
    return this.notes.map((n) => ({
      title: n.title.textContent,
      text: n.content.textContent,
      color: n.element.style.background,
      x: Number.parseInt(n.element.style.left),
      y: Number.parseInt(n.element.style.top),
      collapsed: n.element.classList.contains('collapsed')
    }));
  }

  /**
   * @param {NoteInfo[]} notesData
   * @returns {void}
   */
  loadNotes (notesData) {
    notesData.forEach((noteData) => {
      this.createNote(noteData);
    });
  }

  /**
   * @returns {void}
   */
  clear () {
    this.notes.forEach((n) => n.element.remove());
    this.notes = [];
  }
}

export {StickyNote};
