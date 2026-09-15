const {LinuxDisplayBackend} = require('./linux');
const {HyprlandDisplayBackend} = require('./hyprland');
const {UnsupportedDisplayBackend} = require('./unsupported');

function createDisplayBackend(platform = process.platform, environment = process.env) {
  if (platform !== 'linux')
    return new UnsupportedDisplayBackend(platform);
  if (environment.HYPRLAND_INSTANCE_SIGNATURE || /hyprland/i.test(environment.XDG_CURRENT_DESKTOP ?? ''))
    return new HyprlandDisplayBackend();
  return new LinuxDisplayBackend();
}

module.exports = {createDisplayBackend};
