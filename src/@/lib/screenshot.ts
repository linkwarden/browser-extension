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

async function captureFullPageScreenshot(): Promise<Blob> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.id) {
    throw new Error('Unable to get the current tab.');
  }

  const hideScrollbarsCSS = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

  const addHideScrollbarClassCode = `
  (() => {
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-style';
    style.textContent = \`${hideScrollbarsCSS}\`;
    document.head.appendChild(style);

    const html = document.documentElement;
    const body = document.body;

    html.classList.add('hide-scrollbar');
    body.classList.add('hide-scrollbar');

    return 'Scrollbars hidden.';
  })();
`;

  const removeHideScrollbarClassCode = `
  (() => {
    const style = document.getElementById('hide-scrollbar-style');
    if (style) {
      style.remove();
    }

    const html = document.documentElement;
    const body = document.body;

    html.classList.remove('hide-scrollbar');
    body.classList.remove('hide-scrollbar');

    return 'Scrollbars restored.';
  })();
`;

  // Hide scrollbars
  await browser.tabs.executeScript(tab.id, {
    code: addHideScrollbarClassCode,
  });

  const totalHeight = await browser.tabs
    .executeScript(tab.id, {
      code: 'document.documentElement.scrollHeight',
    })
    .then((results) => results[0]);

  const viewportHeight = await browser.tabs
    .executeScript(tab.id, {
      code: 'window.innerHeight',
    })
    .then((results) => results[0]);

  const viewportWidth = await browser.tabs
    .executeScript(tab.id, {
      code: 'window.innerWidth',
    })
    .then((results) => results[0]);

  const modifyPositionStylesCode = `
    (() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const originalStyles = [];
      elements.forEach((el) => {
        const computedStyle = getComputedStyle(el);
        if (['fixed', 'sticky'].includes(computedStyle.position)) {
          originalStyles.push({
            element: el,
            originalPosition: el.style.position,
          });
          el.style.position = 'relative';
        }
      });
      return originalStyles.map(({ element, originalPosition }) => ({
        elementSelector: element.outerHTML,
        originalPosition,
      }));
    })();
  `;

  // Modify styles to handle fixed and sticky elements
  await browser.tabs
    .executeScript(tab.id, {
      code: modifyPositionStylesCode,
    })
    .then((results) => results[0]);

  const fullPageBlobs: Blob[] = [];
  let scrollPosition = 0;

  while (scrollPosition < totalHeight) {
    await browser.tabs.executeScript(tab.id, {
      code: `window.scrollTo(0, ${scrollPosition});`,
    });

    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId!, {
      format: 'png',
    });

    const blob = await fetch(dataUrl).then((res) => res.blob());
    fullPageBlobs.push(blob);

    scrollPosition += viewportHeight;
    await new Promise((r) => setTimeout(r, 500)); // Allow scrolling to complete.
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

  // Restore scrollbars
  await browser.tabs.executeScript(tab.id, {
    code: removeHideScrollbarClassCode,
  });

  return resultBlob;
}

export default captureFullPageScreenshot;
