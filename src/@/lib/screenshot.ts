import browser from 'webextension-polyfill';

const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

const drawImagesOnCanvas = async (
  canvas: HTMLCanvasElement,
  blobs: Blob[],
  viewportHeight: number,
  totalHeight: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context.');
  }

  let currentHeight = 0;
  for (let index = 0; index < blobs.length - 1; index++) {
    const img = await loadImage(blobs[index]);
    ctx.drawImage(img, 0, currentHeight);
    currentHeight += viewportHeight;
  }

  const remainingHeight = totalHeight - currentHeight;
  if (remainingHeight > 0) {
    const lastImage = await loadImage(blobs[blobs.length - 1]);
    const croppedHeight = viewportHeight - remainingHeight;
    ctx.drawImage(
      lastImage,
      0,
      croppedHeight,
      lastImage.width,
      remainingHeight,
      0,
      currentHeight,
      lastImage.width,
      remainingHeight
    );
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create Blob from canvas.'));
      }
    });
  });
};

async function executeScript(tabId: number, func: any, args: any[] = []) {
  if (typeof chrome.scripting !== 'undefined') {
    return chrome.scripting
      .executeScript({
        target: { tabId },
        func,
        args,
      })
      .then((results) => results[0]?.result);
  } else {
    return browser.tabs
      .executeScript(tabId, {
        code: `(${func})(${args.map((arg) => JSON.stringify(arg)).join(',')})`,
      })
      .then((results) => results[0]);
  }
}

async function captureFullPageScreenshot(): Promise<Blob> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.id) {
    throw new Error('Unable to get the current tab.');
  }

  const addHideScrollbarClass = () => {
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-style';
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add('hide-scrollbar');
    document.body.classList.add('hide-scrollbar');
  };

  const removeHideScrollbarClass = () => {
    const style = document.getElementById('hide-scrollbar-style');
    if (style) style.remove();
    document.documentElement.classList.remove('hide-scrollbar');
    document.body.classList.remove('hide-scrollbar');
  };

  const adjustFixedElements = () => {
    const elements = Array.from(document.querySelectorAll('*'));
    const originalStyles = elements
      .filter((el) => {
        const computedStyle = getComputedStyle(el);
        return ['fixed', 'sticky'].includes(computedStyle.position);
      })
      .map((el) => ({
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
        position: (el as any).style.position,
      }));

    elements.forEach((el) => {
      const computedStyle = getComputedStyle(el);
      if (['fixed', 'sticky'].includes(computedStyle.position)) {
        (el as any).style.position = 'relative';
      }
    });

    return originalStyles;
  };

  const restoreFixedElements = (
    originalStyles: { selector: string; position: string | null }[]
  ) => {
    originalStyles.forEach(({ selector, position }) => {
      const element = document.querySelector(selector);
      if (element) {
        (element as HTMLElement).style.position = position || '';
      }
    });
  };

  await executeScript(tab.id, addHideScrollbarClass);

  const originalStyles = await executeScript(tab.id, adjustFixedElements);

  const totalHeight = (await executeScript(
    tab.id,
    () => document.documentElement.scrollHeight
  )) as number;
  const viewportHeight = (await executeScript(
    tab.id,
    () => window.innerHeight
  )) as number;
  const viewportWidth = (await executeScript(
    tab.id,
    () => window.innerWidth
  )) as number;

  const fullPageBlobs: Blob[] = [];
  let scrollPosition = 0;

  while (scrollPosition < totalHeight) {
    await executeScript(tab.id, (pos: any) => window.scrollTo(0, pos), [
      scrollPosition,
    ]);

    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId!, {
      format: 'png',
    });
    const blob = await fetch(dataUrl).then((res) => res.blob());
    fullPageBlobs.push(blob);

    scrollPosition += viewportHeight;
    await new Promise((r) => setTimeout(r, 500));
  }

  const canvas = document.createElement('canvas');
  canvas.width = viewportWidth;
  canvas.height = totalHeight;

  const resultBlob = await drawImagesOnCanvas(
    canvas,
    fullPageBlobs,
    viewportHeight,
    totalHeight
  );

  await executeScript(tab.id, removeHideScrollbarClass);
  await executeScript(tab.id, restoreFixedElements, [originalStyles]);

  return resultBlob;
}

export default captureFullPageScreenshot;
