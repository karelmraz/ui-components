export function createTooltip(element: HTMLElement) {
  return {
    show(text: string) {
      element.textContent = text;
      element.classList.replace('opacity-0', 'opacity-100');
    },

    hide() {
      element.classList.replace('opacity-100', 'opacity-0');
    },

    moveTo(x: number, y: number) {
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -165%)`;
    },
  };
}
