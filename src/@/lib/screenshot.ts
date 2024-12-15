const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = URL.createObjectURL(blob);
	});
};

const drawImagesOnCanvas = async (canvas: HTMLCanvasElement, blobs: Blob[], viewportHeight: number) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error("Failed to get canvas context.");
	}

	for (let index = 0; index < blobs.length; index++) {
		const img = await loadImage(blobs[index]);
		ctx.drawImage(img, 0, index * viewportHeight);
	}

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to create Blob from canvas."));
			}
		});
	});
};

export async function captureFullPageScreenshot(): Promise<Blob> {
	return new Promise((resolve, reject) => {
		chrome.windows.getCurrent((window) => {
			if (!window || window.id === undefined) {
				reject(new Error("Unable to get the current window ID."));
				return;
			}

			const windowId = window.id;
			chrome.tabs.query({ active: true, windowId }, (tabs) => {
				const tab = tabs[0];
				if (!tab || !tab.id) {
					reject(new Error("Unable to get the current tab."));
					return;
				}

				let fullPageBlob: Blob[] = [];
				let totalHeight = 0;
				let viewportHeight = tab.height!;

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

						let scrollPosition = 0;
						const captureNextScreenshot = () => {
							if (scrollPosition >= totalHeight) {
								const canvas = document.createElement('canvas');
								canvas.width = viewportWidth;
								canvas.height = totalHeight;

								drawImagesOnCanvas(canvas, fullPageBlob, viewportHeight)
									.then((blob) => {
										resolve(blob);
									})
									.catch(reject);
							} else {
								chrome.scripting.executeScript(
									{
										target: { tabId: tab.id! },
										func: (scrollPosition) => scrollTo(0, scrollPosition),
										args: [scrollPosition],
									},
									() => {
										setTimeout(() => {
											chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
												if (chrome.runtime.lastError) {
													reject(new Error(chrome.runtime.lastError.message));
													return;
												}
												if (!dataUrl) {
													reject(new Error("Failed to capture screenshot."));
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
											});
										}, 500);
									}
								);
							}
						};
						captureNextScreenshot();
					}
				);
			});
		});
	});
}