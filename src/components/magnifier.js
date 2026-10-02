/**
 * Image Magnifier Lens Utility
 * Provides 2.5x - 3.5x optical zoom inspection on cursor hover
 */
export function setupMagnifier(imageEl, lensEl, zoomLevel = 2.5) {
  if (!imageEl || !lensEl) return;

  let isHovered = false;

  const getCursorPos = (e) => {
    const rect = imageEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(x, rect.width)),
      y: Math.max(0, Math.min(y, rect.height)),
      width: rect.width,
      height: rect.height
    };
  };

  const onMouseEnter = () => {
    isHovered = true;
    lensEl.style.display = 'block';
    // Set background image of lens to high-res source
    const highResSrc = imageEl.getAttribute('data-zoom') || imageEl.src;
    lensEl.style.backgroundImage = `url("${highResSrc}")`;
    const rect = imageEl.getBoundingClientRect();
    lensEl.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
  };

  const onMouseLeave = () => {
    isHovered = false;
    lensEl.style.display = 'none';
  };

  const onMouseMove = (e) => {
    if (!isHovered) return;
    const pos = getCursorPos(e);

    // Position the lens centered on cursor
    lensEl.style.left = `${pos.x}px`;
    lensEl.style.top = `${pos.y}px`;

    // Position background image inside the lens
    const bgX = (pos.x * zoomLevel) - (lensEl.offsetWidth / 2);
    const bgY = (pos.y * zoomLevel) - (lensEl.offsetHeight / 2);

    lensEl.style.backgroundPosition = `-${bgX}px -${bgY}px`;
  };

  imageEl.addEventListener('mouseenter', onMouseEnter);
  imageEl.addEventListener('mouseleave', onMouseLeave);
  imageEl.addEventListener('mousemove', onMouseMove);

  // Return teardown function
  return () => {
    imageEl.removeEventListener('mouseenter', onMouseEnter);
    imageEl.removeEventListener('mouseleave', onMouseLeave);
    imageEl.removeEventListener('mousemove', onMouseMove);
  };
}
