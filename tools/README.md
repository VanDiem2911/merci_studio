# tools

`tools/realesrgan/` is **not committed and optional now** (binary + 33 MB model). `scripts/build-merci-assets.py` uses it to enlarge the
206 px photos, but only when `SHARP_ONLY = False` in the script. By default the site shows only photos that have a
full-size original, so this tool is not needed; without it the script falls back to a plain Lanczos resize.

## Install Real-ESRGAN (Windows, any Vulkan GPU)

1. Download `realesrgan-ncnn-vulkan-20220424-windows.zip` from
   https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0 (official repo, 45 MB).
2. Extract only these into `tools/realesrgan/`:
   - `realesrgan-ncnn-vulkan.exe`
   - `vcomp140.dll`
   - `models/realesrgan-x4plus.bin` and `models/realesrgan-x4plus.param`
3. `python scripts/build-merci-assets.py` (the first run upscales everything, about 10 minutes on a GTX 1650; results are
   cached in `temp/upscale-cache/`, so later runs only touch new or changed photos).

On laptops with an AMD iGPU and an NVIDIA card the tool can fail with `vkEnumeratePhysicalDevices failed 5`; the script
retries by itself with only the NVIDIA Vulkan driver. To pick a driver by hand set `VK_DRIVER_FILES` to its `*.json`.

## What it does and does not do

The AI model redraws edges, hair, eyelashes and removes JPEG blocks, so 206 px photos look sharp at 824 px. It cannot
recover detail that is not in the file, and on collage tiles (about 68 x 97 px) it starts inventing details, so tiles are
only used for concepts that have no single photos. Real originals always beat upscaling: put them in
`docs/research/merci/facebook-photos/` or `drive-source/` under the same file names and re-run; photos that are already
900 px or larger skip the AI step.
