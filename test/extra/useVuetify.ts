// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';


export default function useVuetify(){

    global.ResizeObserver = require('resize-observer-polyfill');
    return createVuetify({
        components,
        directives,
    });
}
