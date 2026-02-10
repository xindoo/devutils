document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('video-file-input');
    const qualityRange = document.getElementById('quality-range');
    const qualityValueSpan = document.getElementById('quality-value');
    const codecSelect = document.getElementById('codec-select');
    const compressButton = document.getElementById('compress-button');
    const statusMessage = document.getElementById('status-message');
    const progressBar = document.getElementById('progress-bar');
    const downloadLink = document.getElementById('download-link');

    let currentDownloadUrl = null; // 跟踪当前的下载 URL

    qualityRange.addEventListener('input', () => {
        qualityValueSpan.textContent = qualityRange.value;
    });

    compressButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            statusMessage.textContent = '请先选择一个视频文件。';
            return;
        }

        const quality = qualityRange.value;
        const codec = codecSelect.value;

        statusMessage.textContent = '正在处理视频...';
        progressBar.value = 0;
        downloadLink.style.display = 'none';

        try {
            // Load FFmpeg.wasm
            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({
                log: true,
                corePath: 'https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.js' // Specify corePath
            });
            await ffmpeg.load();

            // Write the file to FFmpeg's virtual file system
            ffmpeg.FS('writeFile', file.name, await fetchFile(file));

            // Define FFmpeg command (example: convert to H.264 with specified quality)
            // Quality mapping from 1-100 to FFmpeg's CRF (Constant Rate Factor)
            // Lower CRF means higher quality, typically 0-51.
            // Let's map 100 (best quality) to CRF 18, and 1 (worst) to CRF 40.
            const crf = 40 - (quality / 100) * (40 - 18);
            const outputFileName = `compressed_${file.name.split('.').slice(0, -1).join('.')}.${codec === 'libx264' || codec === 'libx265' ? 'mp4' : 'webm'}`; // Simple output naming

            const command = [
                '-i', file.name,
                '-c:v', codec,
                '-crf', crf.toFixed(0), // Constant Rate Factor for quality
                '-preset', 'medium', // Encoding speed vs compression efficiency
                '-c:a', 'copy', // Copy audio stream without re-encoding
                outputFileName
            ];

            // Run FFmpeg command
            ffmpeg.setProgress(({ ratio }) => {
                progressBar.value = ratio * 100;
            });
            await ffmpeg.run(...command);

            // Read the result file from FFmpeg's virtual file system
            const data = ffmpeg.FS('readFile', outputFileName);

            // 清理旧的下载 URL
            if (currentDownloadUrl) {
                URL.revokeObjectURL(currentDownloadUrl);
            }

            // Create a Blob and a download URL
            const blob = new Blob([data.buffer], { type: `video/${codec === 'libx264' || codec === 'libx265' ? 'mp4' : 'webm'}` }); // Adjust MIME type based on output codec
            currentDownloadUrl = URL.createObjectURL(blob);

            statusMessage.textContent = '处理完成！';
            downloadLink.href = currentDownloadUrl;
            downloadLink.download = outputFileName;
            downloadLink.textContent = `下载 ${outputFileName}`;
            downloadLink.style.display = 'block';

        } catch (error) {
            statusMessage.textContent = '处理失败: ' + error.message;
            console.error('FFmpeg processing error:', error);
        } finally {
            // Clean up FFmpeg's virtual file system if necessary
            // ffmpeg.exit(); // FFmpeg.wasm v0.11.x does not have ffmpeg.exit()
        }
    });
});
