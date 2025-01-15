const canvasForeground = document.getElementById('canvasForeground');
const canvasBackground = document.getElementById('canvasBackground');
const canvasOutput = document.getElementById('canvasOutput');
const ctxForeground = canvasForeground.getContext('2d');
const ctxBackground = canvasBackground.getContext('2d');
const ctxOutput = canvasOutput.getContext('2d');

let imgForeground = null;
let imgBackground = null;

function loadAndDrawImage(file, canvas, context) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            resolve(img);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

document.getElementById('inputForeground').addEventListener('change', async (event) => {
    imgForeground = await loadAndDrawImage(event.target.files[0], canvasForeground, ctxForeground);
});

document.getElementById('inputBackground').addEventListener('change', async (event) => {
    imgBackground = await loadAndDrawImage(event.target.files[0], canvasBackground, ctxBackground);
});

document.getElementById('btnMerge').addEventListener('click', () => {
    if (!imgForeground || !imgBackground) {
        alert('Please upload both foreground and background images.');
        return;
    }
    mergeImages();
});

document.getElementById('btnClear').addEventListener('click', () => {
    ctxForeground.clearRect(0, 0, canvasForeground.width, canvasForeground.height);
    ctxBackground.clearRect(0, 0, canvasBackground.width, canvasBackground.height);
    ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    imgForeground = null;
    imgBackground = null;
    document.getElementById('inputForeground').value = '';
    document.getElementById('inputBackground').value = '';
});

function mergeImages() {
    canvasOutput.width = canvasOutput.clientWidth;
    canvasOutput.height = canvasOutput.clientHeight;

    const fgData = ctxForeground.getImageData(0, 0, canvasForeground.width, canvasForeground.height);
    const bgData = ctxBackground.getImageData(0, 0, canvasBackground.width, canvasBackground.height);
    const outputData = ctxOutput.createImageData(canvasOutput.width, canvasOutput.height);

    for (let y = 0; y < canvasOutput.height; y++) {
        for (let x = 0; x < canvasOutput.width; x++) {
            const index = (y * canvasOutput.width + x) * 4;
            const fgIndex = (Math.floor(y * canvasForeground.height / canvasOutput.height) * canvasForeground.width +
                             Math.floor(x * canvasForeground.width / canvasOutput.width)) * 4;
            const bgIndex = (Math.floor(y * canvasBackground.height / canvasOutput.height) * canvasBackground.width +
                             Math.floor(x * canvasBackground.width / canvasOutput.width)) * 4;

            const [r, g, b] = [fgData.data[fgIndex], fgData.data[fgIndex + 1], fgData.data[fgIndex + 2]];

            // Replace green pixels (if green is dominant) with background image pixels
            if (g > r && g > b) {
                outputData.data.set(bgData.data.slice(bgIndex, bgIndex + 4), index);
            } else {
                outputData.data.set(fgData.data.slice(fgIndex, fgIndex + 4), index);
            }
        }
    }

    ctxOutput.putImageData(outputData, 0, 0);
}
