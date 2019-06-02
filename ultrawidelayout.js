const Me = imports.misc.extensionUtils.getCurrentExtension();
const GnomesomeSettings = Me.imports.gnomesome_settings;
const logging = Me.imports.logging;
const logger = logging.getLogger('Gnomesome.Layout.Ultrawide');
const SplitLayout = Me.imports.splitlayout;

function apply(gswindows, split_pos, n_master) {
    const settings = new GnomesomeSettings.Prefs();
    logger.debug("Info: relayout max_nwindows" + gswindows.length);
    if (gswindows.length <= 0) {
        // no windows available
        return;
    }
    // check consistency and add allowed windows
    var monitor_idx = gswindows[0].get_monitor();
    var workspace = gswindows[0].get_workspace();
    var gswindows_to_layout = gswindows;
    for (var idx = 0; idx < gswindows.length; ++idx) {
        gswindows[idx].unmaximize_if_not_floating();
    }

    const work_area = workspace.get_work_area_for_monitor(monitor_idx);
    work_area.x += settings.OUTER_GAPS.get();
    work_area.y += settings.OUTER_GAPS.get();
    work_area.width -= 2 * settings.OUTER_GAPS.get();
    work_area.height -= 2 * settings.OUTER_GAPS.get();
    logger.debug("Info: windows to layout " + gswindows_to_layout.length);

     if (work_area.width < 2000) {
         return SplitLayout.applyVBoxLayout(gswindows, split_pos, n_master);
     }

    // [client] [inner gap] [master] [inner gap] [client]
    //
    //
    let inner_gap = settings.INNER_GAPS.get()
    let master_width = work_area.width * split_pos - inner_gap;
    let client_width = (work_area.width - master_width - inner_gap) / 2;
    let master_x = work_area.x + client_width + inner_gap;

    var user = false;
    // handle dependend on number of windows
    if (gswindows_to_layout.length === 0) {
        // nothing to do
    } else if (gswindows_to_layout.length === 1) {
        // only one image, center main window
        gswindows_to_layout[0].window.move_resize_frame(
            user,
            master_x, work_area.y,
            master_width, work_area.height);
    } else {
        // determine areas
        if(n_master > gswindows_to_layout.length) {
            n_master = gswindows_to_layout.length
        }
        var gsmasters = gswindows_to_layout.slice(0, n_master);

        // place up to n_master windows to the right
        let n_right = Math.min(n_master, Math.floor((gswindows_to_layout.length - n_master)/2));

        // and the rest on the left
        let n_left = gswindows_to_layout.length - n_master - n_right;

        var gsclients_right = gswindows_to_layout.slice(n_master, n_master + n_right);
        var gsclients_left = gswindows_to_layout.slice(n_master + n_right, n_master + n_right + n_left);

        // Horizontal layout
        if (gsmasters.length > 0) {
            const sub_height = (work_area.height - (gsmasters.length - 1) * inner_gap) / gsmasters.length;
            for (let idx = 0; idx < gsmasters.length; ++idx) {
                // first image half size, all others in rows
                gsmasters[idx].window.move_resize_frame(
                    user,
                    master_x,
                    work_area.y + idx * (sub_height + inner_gap),
                    master_width, sub_height);
            }
        }

        if (gsclients_right.length > 0) {
            const sub_height = (work_area.height - (gsclients_right.length - 1) * inner_gap) / gsclients_right.length;
            for (let idx = 0; idx < gsclients_right.length; ++idx) {
                gsclients_right[idx].window.move_resize_frame(
                    user,
                    master_x + master_width + inner_gap,
                    work_area.y + idx * (sub_height + inner_gap),
                    client_width, sub_height);
            }
        }

        if (gsclients_left.length > 0) {
            const sub_height = (work_area.height - (gsclients_left.length - 1) * inner_gap) / gsclients_left.length;
            for (let idx = 0; idx < gsclients_left.length; ++idx) {
                gsclients_left[idx].window.move_resize_frame(
                    user,
                    work_area.x,
                    work_area.y + idx * (sub_height + inner_gap),
                    client_width, sub_height);
            }
        }
    }
}

function enterUltrawideLayout(gswindows, split_pos, n_master) {
}

function applyUltrawideLayout(gswindows, split_pos, n_master) {
    apply(gswindows, split_pos, n_master, 1);
}

function exitUltrawideLayout(gswindows, split_pos, n_master) {
}
