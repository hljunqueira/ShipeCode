import { useRef, useEffect } from 'react';

/**
 * Hook para scroll horizontal arrastável
 * Permite arrastar o conteúdo com o mouse como se fosse touch
 */
export const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      // Previne scroll se clicar em botão ou item arrastável
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[draggable="true"]')) return;
      
      isDown = true;
      slider.classList.add('cursor-grabbing');
      slider.classList.remove('cursor-grab');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Multiplicador de velocidade
      slider.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e: WheelEvent) => {
      // Scroll horizontal com roda do mouse
      if (e.deltaY === 0) return;
      slider.scrollLeft += e.deltaY;
    };

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);
    slider.addEventListener('wheel', onWheel);

    // Estilo inicial do cursor
    slider.classList.add('cursor-grab');

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
      slider.removeEventListener('wheel', onWheel);
    };
  }, []);

  return ref;
};

export default useDraggableScroll;
