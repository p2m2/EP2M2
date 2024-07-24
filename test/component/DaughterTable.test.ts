/** SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * 
 *  SPDX-License-Identifier: MIT
 * 
 * This file test the DaughterTable component
*/

import { mount, config } from '@vue/test-utils';
import { expect, test, describe } from 'vitest';
import { vuetify4Test } from '../extra/vuetify4Test';
import DaughterTable from '@/components/DaughterTable.vue';

const vuetify = vuetify4Test();


const globalConfig = {
    global: {
        plugins: [vuetify],
        stubs: {
            // Default layout is unactive
            NuxtLayout: true,
        },
        mocks:{
            // thx https://stackoverflow.com/a/73630072
            // Get key of translate
            t: (tKey:string) => tKey
        }
}}


function checkHearder(wrapper: any){
    expect(wrapper.text()).toContain('header.nameDaughterFile');
    expect(wrapper.text()).toContain('header.nameMeta');
    expect(wrapper.text()).toContain('header.area');
    expect(wrapper.text()).toContain('header.concentration');
}

describe('DaughterTable', () => {

    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
    })
    
    afterEach(() => {
        config.global.renderStubDefaultSlot = false;
    })

    test('DaughterTable empty', async () => {
        const wrapper = mount(DaughterTable, {
            ...globalConfig
        });
        checkHearder(wrapper);
        expect(wrapper.text()).toContain('message.noDaughterFile');
    });

    test('DaughterTable with data', async () => {
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    {
                        idFile: "1",
                        nameFile: 'name_one',
                        nameMeta: 'meta_one',
                        area: 17754,
                        concentration: 221584
                    },
                    {
                        idFile: "1",
                        nameFile: 'name_one',
                        nameMeta: 'meta_two',
                        area: 314,
                        concentration: 4788
                    }
                ]
            }
        });
      

        checkHearder(wrapper);
        // Group of idFile1 is closed
        expect(wrapper.text()).not.toContain('meta_one');
        expect(wrapper.text()).not.toContain('17754');
        expect(wrapper.text()).not.toContain('221584');
        expect(wrapper.text()).not.toContain('meta_one');
        expect(wrapper.text()).not.toContain('314');
        expect(wrapper.text()).not.toContain('4788');
        expect(wrapper.text()).toContain('name_one');
        // Check group of name1 in same column with delete button
        const tBody = wrapper.find('tbody');       
        const tRow= tBody.findAll('tr');
        expect(tRow.length).toBe(3);
        expect(tRow[1].text()).toContain('name_one');
        expect(tRow[1].find("mdi-delete")).toBeTruthy();

    });
});