/** SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * 
 *  SPDX-License-Identifier: MIT
 * 
 * This file test the DaughterTable component
*/

import { mount, config } from '@vue/test-utils';
import { expect, test, describe, vi } from 'vitest';
import { vuetify4Test } from '../extra/vuetify4Test';
import DaughterTable from '@/components/DaughterTable.vue';
import { createI18n,  } from "vue-i18n";
import { selectInputByValue } from '../extra/selectBy';

//  Overwrite the internalization plugin with empty one
const i18n = createI18n({});
config.global.plugins = [i18n];
// Define vuetify plugin for all test
const vuetify = vuetify4Test();

// Define global configuration for all test
const globalConfig = {
    global: {
        plugins: [vuetify],
        stubs: {
            // Default layout is unactive
            NuxtLayout: true,
        },
        mocks: {
            // thx https://stackoverflow.com/a/73630072
            // Get key of translate
            t: (tKey: string) => tKey
        }
    }
}

// Define data for test
const daughter_one = [{
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
}];

const daughter_twenteen = [{
    idFile: "12",
    nameFile: 'name_twenteen',
    nameMeta: 'meta_twenteen',
    area: 17555,
    concentration: 1144
},
{
    idFile: "12",
    nameFile: 'name_twenteen',
    nameMeta: 'meta_twenteen',
    area: 24,
    concentration: 159
}];

// Mock fetch
const $fetchMock = vi.fn();
vi.stubGlobal('$fetch',$fetchMock);

/**
 * Check header of table
 * @param wrapper html wrapper
 */
function checkHearder(wrapper: any) {
    expect(wrapper.text()).toContain('header.nameDaughterFile');
    expect(wrapper.text()).toContain('header.nameMeta');
    expect(wrapper.text()).toContain('header.area');
    expect(wrapper.text()).toContain('header.concentration');
}

/**
 * Check group of daughter solution is close
 * @param wrapper html wrapper
 * @param group data of daughter solution
 */
function checkCloseGroup(wrapper: any, group:{[key:string]:string|number}[]) {
    for(const elt of group) {
        // we see only nameFile
        expect(wrapper.text()).toContain(elt.nameFile);
        expect(wrapper.text()).not.toContain(elt.nameMeta);
        expect(wrapper.text()).not.toContain(elt.area);
        expect(wrapper.text()).not.toContain(elt.concentration);
    }
}

/**
 * Check group of daughter solution is open
 * @param wrapper html wrapper
 * @param group data of daughter solution
 */
function checkOpenGroup(wrapper: any, group:{[key:string]:string|number}[]) {
    for(const elt of group) {
        expect(wrapper.text()).toContain(elt.nameFile);
        expect(wrapper.text()).toContain(elt.nameMeta);
        expect(wrapper.text()).toContain(elt.area);
        // get input element
        const input = wrapper.findAll('input');
        // check if each concentration is in input with correct value
        expect(input.length).toBeGreaterThanOrEqual(group.length);
        const concentration = selectInputByValue(input,
                                                 elt.concentration.toString());
        expect(concentration).not.toBeNull();
    }
}

/**
 * Check group of daughter solution is not present
 * @param wrapper html wrapper
 * @param group data of daughter solution
 */
function checkNoGroup(wrapper: any, group:{[key:string]:string|number}[]) {
    for(const elt of group) {
        expect(wrapper.text()).not.toContain(elt.nameFile);
        expect(wrapper.text()).not.toContain(elt.nameMeta);
        expect(wrapper.text()).not.toContain(elt.area);
        expect(wrapper.text()).not.toContain(elt.concentration);
    }
}

describe('DaughterTable', () => {

    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        vi.resetAllMocks();
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

    test('DaughterTable with one daughter file', async () => {
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one
                ]
            }
        });


        checkHearder(wrapper);
        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Check group of name1 in same column with delete button
        const tBody = wrapper.find('tbody');
        expect(tBody.findAll('input').length).toBe(0);
        const tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(3);
        expect(tRow[1].text()).toContain('name_one');
        expect(tRow[1].find("mdi-delete")).toBeTruthy();

    });
    test('DaughterTable with one daughter file: open/close', async () => {
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one
                ]
            }
        });


        checkHearder(wrapper);
        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Check group of name1 in same column with delete button
        const tBody = wrapper.find('tbody');
        const tRow = tBody.findAll('tr');
        expect(tBody.findAll('input').length).toBe(0);
        expect(tRow.length).toBe(3);
        expect(tRow[1].text()).toContain('name_one');
        expect(tRow[1].find("mdi-delete")).toBeTruthy();

        // Open group of name_one
        const button = tRow[1].find('button');
        await button.trigger('click');
        expect(tBody.findAll('tr').length).toBe(5);
        checkOpenGroup(wrapper, daughter_one);

        // Close group of name_one
        await button.trigger('click');
        expect(tBody.findAll('tr').length).toBe(3);
        checkCloseGroup(wrapper, daughter_one);

    });
    test('DaughterTable with two daughter file', async () => {
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one,
                    ...daughter_twenteen
                ]
            }
        });
        checkHearder(wrapper);

        const tBody = wrapper.find('tbody');
        const tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(4);
        expect(tBody.findAll('input').length).toBe(0);

        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Group of idFile12 is closed
        checkCloseGroup(wrapper, daughter_twenteen);  
        
        // Open group of name_twenteen
        const button = tRow[2].find('button');
        await button.trigger('click');
        expect(tBody.findAll('tr').length).toBe(6);
        expect(tBody.findAll('input').length).toBe(2);
        checkOpenGroup(wrapper, daughter_twenteen);
        checkCloseGroup(wrapper, daughter_one);

    });
    test('DaughterTable with two daughter file delete', async () => {
        $fetchMock.mockResolvedValueOnce(true);
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one,
                    ...daughter_twenteen
                ]
            }
        });
        checkHearder(wrapper);

        let tBody = wrapper.find('tbody');
        let tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(4);
        expect(tBody.findAll('input').length).toBe(0);

        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Group of idFile12 is closed
        checkCloseGroup(wrapper, daughter_twenteen);  

        // Delete group of name_one
        const btDel = tRow[1].findComponent('.mdi-delete');
        await btDel.trigger('click');

        expect($fetchMock).toHaveBeenCalled();
        expect($fetchMock).toHaveBeenCalledWith('/api/delFile', {
            method: 'POST',
            body: ["1"],
        });
        tBody = wrapper.find('tbody');
        tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(3);
        expect(tBody.findAll('input').length).toBe(0);
        checkNoGroup(wrapper, daughter_one);
        checkCloseGroup(wrapper, daughter_twenteen);
    });
    test('DaughterTable with two daughter file delete', async () => {
        $fetchMock.mockResolvedValueOnce(true);
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one,
                    ...daughter_twenteen
                ]
            }
        });
        checkHearder(wrapper);

        let tBody = wrapper.find('tbody');
        let tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(4);
        expect(tBody.findAll('input').length).toBe(0);

        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Group of idFile12 is closed
        checkCloseGroup(wrapper, daughter_twenteen);  

        // Delete group of name_one
        const btDel = tRow[1].findComponent('.mdi-delete');
        await btDel.trigger('click');

        expect($fetchMock).toHaveBeenCalled();
        expect($fetchMock).toHaveBeenCalledWith('/api/delFile', {
            method: 'POST',
            body: ["1"],
        });
        tBody = wrapper.find('tbody');
        tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(3);
        expect(tBody.findAll('input').length).toBe(0);
        checkNoGroup(wrapper, daughter_one);
        checkCloseGroup(wrapper, daughter_twenteen);
    });
    test('DaughterTable with two daughter file delete fail', async () => {
        $fetchMock.mockResolvedValueOnce(new Error('Error'));
        const wrapper = mount(DaughterTable, {
            ...globalConfig,
            props: {
                modelValue: [
                    ...daughter_one,
                    ...daughter_twenteen
                ]
            }
        });
        checkHearder(wrapper);

        let tBody = wrapper.find('tbody');
        let tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(4);
        expect(tBody.findAll('input').length).toBe(0);

        // Group of idFile1 is closed
        checkCloseGroup(wrapper, daughter_one);

        // Group of idFile12 is closed
        checkCloseGroup(wrapper, daughter_twenteen);  

        // Delete group of name_one
        const btDel = tRow[1].findComponent('.mdi-delete');
        await btDel.trigger('click');

        expect($fetchMock).toHaveBeenCalled();
        expect($fetchMock).toHaveBeenCalledWith('/api/delFile', {
            method: 'POST',
            body: ["1"],
        });
        tBody = wrapper.find('tbody');
        tRow = tBody.findAll('tr');
        expect(tRow.length).toBe(4);
        expect(tBody.findAll('input').length).toBe(0);
        checkCloseGroup(wrapper, daughter_one);
        checkCloseGroup(wrapper, daughter_twenteen);
    });
});