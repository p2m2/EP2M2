// Copyright © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';


export function vuetify4Test() {
    const vuetify = createVuetify({
    components,
    directives,
    });

    global.ResizeObserver = require('resize-observer-polyfill');

    return vuetify;
}