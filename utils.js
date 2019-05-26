const Meta = imports.gi.Meta;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;
const logging = Me.imports.logging;
const logger = logging.getLogger('Gnomesome.Utils');

// of each added connection in `owner.bound_signals`,
// for later cleanup in disconnect_tracked_signals().
// Also logs any exceptions that occur.
function connect_and_track(owner, subject, name, cb, after) {
    if (typeof owner.bound_signals === 'undefined') {
        owner.bound_signals = [];
    }
    const method = after ? 'connect_after':'connect';
    owner.bound_signals.push({
            subject: subject,
            binding: subject[method](name, function() {
                const t = this;
                try {
                    return cb.apply(t,arguments);
                } catch(e) {
                    logger.error("Uncaught error in " + name + " signal handler: " + e + "\n" + e.stack);
                    throw e;
                }
            })
    });
}

// Disconnect all tracked signals from the given object.
// Used for reverting signals bound via `connect_and_track()`
function disconnect_tracked_signals(owner, subject) {
    if (arguments.length > 1 && !subject) {
        throw new Error("[gnomesome] disconnect_tracked_signals called with null subject");
    }
    let count = 0;
    for (let i = owner.bound_signals.length-1; i >= 0; i--) {
        const sig = owner.bound_signals[i];
        if (subject == null || subject === sig.subject) {
            sig.subject.disconnect(sig.binding);
            // delete signal
            owner.bound_signals.splice(i, 1);
            count++;
        }
    }
    if (count>0) {
        logger.info("disconnected " + count + " listeners from " +
                owner + (subject == null ? "" : (" on " + subject)));
    }
}

var DisplayWrapper = {
    getScreen() {
        return global.screen || global.display;
    },
    getWorkspaceManager() {
        return global.screen || global.workspace_manager;
    },
    getMonitorManager() {
        return global.screen || Meta.MonitorManager.get();
    },
    getDisplay() {
      return global.display || global.screen;
    },
};

var icon = function(name) {
    return Gio.icon_new_for_string(`${Me.path}/icons/status/${name}.svg`);
};

