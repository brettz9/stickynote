/* eslint-disable no-alert -- Demo */
import StickyNote from '../src/index.js';

// Initialize the sticky notes library
const stickyNotes = new StickyNote({
  colors: ['#fff740', '#ff7eb9', '#7afcff', '#feff9c', '#a7ffeb', '#c7ceea']
});

// Add note button
document.querySelector('#addNote').addEventListener('click', () => {
  stickyNotes.createNote({
    text: 'Double-click to edit!\nDrag me around.\nClick 🎨 to change color.',
    // eslint-disable-next-line sonarjs/pseudo-random -- Safe
    x: (Math.random() * (window.innerWidth - 300)) + 50,
    // eslint-disable-next-line sonarjs/pseudo-random -- Safe
    y: (Math.random() * (window.innerHeight - 300)) + 100
  });
});

// Save notes to localStorage
document.querySelector('#saveNotes').addEventListener('click', () => {
  const notes = stickyNotes.getAllNotes();
  localStorage.setItem('stickyNotes', JSON.stringify(notes));
  alert('Notes saved!');
});

// Load notes from localStorage
document.querySelector('#loadNotes').addEventListener('click', () => {
  const saved = localStorage.getItem('stickyNotes');
  if (saved) {
    stickyNotes.clear();
    stickyNotes.loadNotes(JSON.parse(saved));
    alert('Notes loaded!');
  } else {
    alert('No saved notes found!');
  }
});

// Clear all notes
document.querySelector('#clearNotes').addEventListener('click', () => {
  if (confirm('Delete all notes?')) {
    stickyNotes.clear();
  }
});

// Create a welcome note on load
stickyNotes.createNote({
  text: 'Welcome to Sticky Notes!\n\nClick "Add Note" to create more notes.',
  x: 100,
  y: 150
});
