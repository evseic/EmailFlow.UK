// Include expanded examples and maps when the reader prints the guide.
(() => {
  const previous = new Map();
  addEventListener('beforeprint', () => {
    document.querySelectorAll('.guide-disclosure').forEach(detail => {
      if (!previous.has(detail)) previous.set(detail, detail.open);
      detail.open = true;
    });
  });
  addEventListener('afterprint', () => {
    previous.forEach((open, detail) => { detail.open = open; }); previous.clear();
  });
})();
