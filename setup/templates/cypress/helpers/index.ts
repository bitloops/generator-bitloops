export const getWindowBounds = (window: Window): DOMRect => {
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
};

export const isOutOfBounds = (inRect: DOMRect, outRect: DOMRect): boolean => {
  const isOut =
    inRect.left < outRect.left ||
    inRect.right > outRect.right ||
    inRect.bottom > outRect.bottom ||
    inRect.top < outRect.top;
  return isOut;
};

export const isOutOfHorizontalBounds = (inRect: DOMRect, outRect: DOMRect): boolean => {
  const isOut =
    inRect.left < outRect.left ||
    inRect.right > outRect.right;
  return isOut;
};

export const hasHorizontalScroll = (document: Document): boolean => {
  const scrollingElement = document.scrollingElement;
  if (!scrollingElement) {
    return false;
  }
  const scrollWidth = scrollingElement.scrollWidth || 0;
  const clientWidth = scrollingElement.clientWidth || 0;

  return scrollWidth > clientWidth;
};

export const areVerticalLeftAligned = (rects: DOMRect[]): boolean => {
  const firstRect = rects[0];
  for (let i = 1; i < rects.length; i++) {
    if (rects[i].x !== firstRect.x) {
      return false;
    }
  }
  return true;
};

export const areVerticalCenteredAligned = (rects: DOMRect[]): boolean => {
  const firstRect = rects[0];
  const xCenterOfFirstRect = firstRect.x + firstRect.width / 2;
  for (let i = 1; i < rects.length; i++) {
    const xCenterOfRect = rects[i].x + rects[i].width / 2;
    if (xCenterOfRect !== xCenterOfFirstRect) {
      return false;
    }
  }
  return true;
};

export const areVerticalRightAligned = (rects: DOMRect[]): boolean => {
  const firstRect = rects[0];
  const xRightOfFirstRect = firstRect.x + firstRect.width;
  for (let i = 1; i < rects.length; i++) {
    const xRightOfRect = rects[i].x + rects[i].width;
    if (xRightOfRect !== xRightOfFirstRect) {
      return false;
    }
  }
  return true;
};
