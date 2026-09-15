# Virtual Display

**Share a dedicated screen through Sunshine without an HDMI or DisplayPort dummy plug.**

[![CI](https://github.com/ErickWendel/virtual-display/actions/workflows/ci.yml/badge.svg)](https://github.com/ErickWendel/virtual-display/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/ErickWendel/virtual-display)](https://github.com/ErickWendel/virtual-display/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform: Linux](https://img.shields.io/badge/platform-Linux-72d9ff.svg)](#current-support)

Virtual Display was created for people who use
[Sunshine](https://github.com/LizardByte/Sunshine) to stream their desktop and
games but do not want to keep a physical dummy dongle connected to the GPU.
It gives you a friendly tray control for an existing software-provisioned
monitor: turn the streaming display on when you need it, then remove it from
your desktop when the session is over.

No dummy plug. No extra cable. No permanently extended desktop.

<p align="center">
  <img src="assets/virtual-display-app.png" width="520" alt="Virtual Display application showing a physical HDMI monitor and an online DP virtual display">
</p>

## Why use it?

A dedicated virtual monitor lets Sunshine capture a predictable output without
sharing your physical screen or changing its resolution. Virtual Display keeps
that output out of the way until it is actually needed.

- Enable or disable the virtual output from the system tray.
- Keep the physical display primary.
- Start automatically after login while the virtual output remains disabled.
- Open GNOME Display Settings directly from the app.
- Avoid buying and maintaining an HDMI or DisplayPort dummy plug.
- Use the display with Sunshine, screen recorders, test tools, or any other app.

Virtual Display is independent from Sunshine. It does not change Sunshine's
configuration and can be used with any software that benefits from a separate
monitor.

## How it works

1. On GNOME, the operating system exposes a virtual DRM connector using EDID
   firmware or another platform-specific virtual display driver. On Hyprland,
   Virtual Display creates a compositor headless output when enabled.
2. Virtual Display discovers the physical and virtual connectors.
3. The tray menu applies a safe GNOME layout through `gdctl` when you choose
   **Enable Virtual Display** or **Disable Virtual Display**.

The application intentionally does not install a display driver. Provisioning
is hardware- and operating-system-specific, and forcing the wrong connector can
make a login screen inaccessible.

## Current support

- Linux with GNOME, Wayland, and `gdctl`, or Hyprland with `hyprctl`.
- GNOME requires a virtual DRM connector supplied through the kernel's
  `drm.edid_firmware=CONNECTOR:FILE` argument. Hyprland uses a `VIRTUAL-1`
  headless output and does not require EDID firmware.
- Exactly one active physical monitor.

If multiple physical monitors are active, the app refuses to change the layout
rather than risk disabling or rearranging them. Windows and macOS backends are
planned but not implemented yet.

## Download and install

Download the latest packages from
[GitHub Releases](https://github.com/ErickWendel/virtual-display/releases/latest).

### Bazzite and other immutable desktops

Use the **AppImage**. It runs without layering an RPM into the immutable system
and does not require a reboot.

For the smoothest desktop integration, open the downloaded AppImage with
[Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) and choose
**Move to the app menu**. Alternatively, run it directly:

```bash
chmod +x virtual-display-*-x86_64.AppImage
./virtual-display-*-x86_64.AppImage
```

### Debian and Ubuntu

```bash
sudo apt install ./virtual-display-*-x86_64.deb
```

### Fedora and other RPM-based systems

```bash
sudo dnf install ./virtual-display-*-x86_64.rpm
```

Use the AppImage instead of the RPM on Bazzite, Silverblue, Kinoite, and other
immutable Fedora variants.

### Arch Linux and Arch-based systems

Download the `.pacman` package from the latest
[GitHub Release](https://github.com/ErickWendel/virtual-display/releases/latest)
and install it with:

```bash
sudo pacman -U ./virtual-display-*.pacman
```

The package is also suitable for Manjaro, EndeavourOS, and other Arch-based
distributions. It installs the application, desktop entry, icon, and required
runtime dependencies without requiring AppImage/FUSE support.

### Portable archive

The `.tar.gz` release contains the unpacked application and is useful when
AppImage, DEB, and RPM installation are unavailable.

Every release includes `SHA256SUMS`. Verify files downloaded into the same
directory with:

```bash
sha256sum --check SHA256SUMS --ignore-missing
```

Launch Virtual Display once after installing it. The app creates its login
autostart entry and remains available from the system tray.

## Build from source

Node.js 22.12 or newer is required. On immutable Bazzite systems, Node can be
installed through Linuxbrew without changing the base image.

```bash
brew install node
npm ci
npm test
npm run dist
```

`npm run dist` creates the x86_64 AppImage. To build every Linux release format:

```bash
npm run dist:linux
```

For a local source build, the helper below installs the generated AppImage under
`~/.local/lib`, creates a desktop launcher, and starts it:

```bash
./scripts/install.sh
```

The helper does not modify kernel arguments, GDM, Sunshine, Steam, or existing
monitor configuration files.

## Tray controls

The monitor icon appears in GNOME's top bar through the AppIndicator extension.

- **Open Virtual Display** opens the status window.
- **Enable Virtual Display** adds the virtual monitor to the desktop.
- **Disable Virtual Display** removes it while keeping the physical display.
- **Refresh** checks the current GNOME display state.
- **Quit** stops the tray application.

Closing the status window keeps the tray process running.

## Uninstall

```bash
./scripts/rollback.sh
```

Uninstall removes only the application, launcher, icon, and autostart entry. It
intentionally leaves virtual-display drivers and kernel provisioning alone.

## EDID development

`build/generic-4k60.bin` is the EDID used while developing the Linux backend.
It advertises common modes up to 4K at 60 Hz, HDR10, 10-bit color, and stereo
audio. Rebuild and validate it with:

```bash
./scripts/generate-edid.sh
```

Do not deploy an EDID unless `edid-decode --check` reports
`EDID conformity: PASS`.

## Contributing

Windows and macOS need their own implementations behind the existing platform
backend boundary. Contributions for additional compositors, virtual display
drivers, packaging formats, and safer multi-monitor preservation are welcome.

## Project layout

- `app/`: Electron main process, renderer, preload bridge, and OS backends.
- `test/`: backend parser and safety tests.
- `scripts/`: application installation, removal, screenshot, and EDID tooling.
- `vendor/edid-generator/`: required EDID generator modules and original license.

## License

Virtual Display is released under the MIT License. See `LICENSE` and
`THIRD_PARTY_NOTICES.md`.
