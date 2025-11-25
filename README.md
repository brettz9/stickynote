# stickynote

Creates collapsible client-side sticky notes with changeable title and color.

See the [demo](https://brettz9.github.io/stickynote/demo/).

## Installation

```sh
npm i stickynote
```

## Usage

```js
import StickyNote from 'stickynote';

const stickyNotes = new StickyNote({
  colors: ['#fff740', '#ff7eb9', '#7afcff', '#feff9c', '#a7ffeb', '#c7ceea']
});

stickyNotes.createNote({
  // eslint-disable-next-line @stylistic/max-len -- Long
  html: 'Double-click to edit!<br />Drag me around.<br />Click 🎨 to change color.',
  x: 150,
  y: 150
});
```
