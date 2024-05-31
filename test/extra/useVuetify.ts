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
