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


export async function captureFullPageScreenshot(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent((window) => {
      if (!window || window.id === undefined) {
        reject(new Error('Unable to get the current window ID.'));
        return;
      }

      const windowId = window.id;
      chrome.tabs.query({ active: true, windowId }, (tabs) => {
        const tab = tabs[0];
        if (!tab || !tab.id) {
          reject(new Error('Unable to get the current tab.'));
          return;
        }

        const fullPageBlob: Blob[] = [];
        let totalHeight = 0;
        const viewportHeight = tab.height!;

        const modifyPositionStyles = () => {
          const elements = Array.from(document.querySelectorAll('*'));
          const originalStyles: {
            element: HTMLElement;
            originalPosition: string | null;
          }[] = [];
          elements.forEach((el) => {
            const computedStyle = getComputedStyle(el);
            if (['fixed', 'sticky'].includes(computedStyle.position)) {
              originalStyles.push({
                element: el as HTMLElement,
                originalPosition: (el as HTMLElement).style.position || null,
              });
              (el as HTMLElement).style.position = 'relative';
            }
          });
          return originalStyles;
        };

        const restorePositionStyles = (
          originalStyles: {
            element: HTMLElement;
            originalPosition: string | null;
          }[]
        ) => {
          originalStyles.forEach(({ element, originalPosition }) => {
            element.style.position = originalPosition ?? '';
          });
        };

        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id! },
            func: () => document.documentElement.scrollHeight,
          },
          (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            totalHeight = result[0].result;
            const viewportWidth = tab.width!;

            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id! },
                func: modifyPositionStyles,
              },
              (originalStylesResult) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }

                const originalStyles = originalStylesResult[0].result;
                let scrollPosition = 0;

                const captureNextScreenshot = () => {
                  if (scrollPosition >= totalHeight) {
                    const canvas = document.createElement('canvas');
                    canvas.width = viewportWidth;
                    canvas.height = totalHeight;

                    drawImagesOnCanvas(canvas, fullPageBlob, viewportHeight, totalHeight)
                      .then((blob) => {
                        chrome.scripting.executeScript(
                          {
                            target: { tabId: tab.id! },
                            func: restorePositionStyles,
                            args: [originalStyles],
                          },
                          () => resolve(blob)
                        );
                      })
                      .catch(reject);
                  } else {
                    const scrollToPosition = Math.min(scrollPosition, totalHeight - viewportHeight);
                    chrome.scripting.executeScript(
                      {
                        target: { tabId: tab.id! },
                        func: (scrollPosition) => scrollTo(0, scrollPosition),
                        args: [scrollToPosition],
                      },
                      () => {
                        setTimeout(() => {
                          chrome.tabs.captureVisibleTab(
                            windowId,
                            { format: 'png' },
                            (dataUrl) => {
                              if (chrome.runtime.lastError) {
                                reject(
                                  new Error(chrome.runtime.lastError.message)
                                );
                                return;
                              }
                              if (!dataUrl) {
                                reject(
                                  new Error('Failed to capture screenshot.')
                                );
                                return;
                              }
                              fetch(dataUrl)
                                .then((res) => res.blob())
                                .then((blob) => {
                                  fullPageBlob.push(blob);
                                  scrollPosition += viewportHeight;
                                  captureNextScreenshot();
                                })
                                .catch(reject);
                            }
                          );
                        }, 500);
                      }
                    );
                  }
                };
                captureNextScreenshot();
              }
            );
          }
        );
      });
    });
  });
}
