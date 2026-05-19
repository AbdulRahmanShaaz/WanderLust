document.querySelectorAll('[data-flash-dismiss]').forEach((button) => {
  button.addEventListener('click', () => {
    const flash = button.closest('.flash');
    if (!flash) return;

    const stack = flash.parentElement;
    flash.classList.add('flash-dismissed');
    flash.addEventListener('transitionend', () => {
      flash.remove();
      if (stack && stack.children.length === 0) stack.remove();
    }, { once: true });
  });
});
