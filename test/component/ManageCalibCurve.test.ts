/** SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * 
 *  SPDX-License-Identifier: MIT
 * 
 * This file test the ManageCalibCurve component
*/
import { mount, config, flushPromises } from '@vue/test-utils';
import { expect, test, describe, vi } from 'vitest';
import { vuetify4Test } from '../extra/vuetify4Test';
import { selectByText } from '../extra/selectBy';
import ManageCalibCurve from '@/components/ManageCalibCurve.async.vue';

// Mock fetch
const $fetchMock = vi.fn();
vi.stubGlobal('$fetch',$fetchMock);

// Mock success message
const successMock = vi.fn();
vi.stubGlobal('success',successMock);

// Mock error message
const errorMock = vi.fn();
vi.stubGlobal('error',errorMock);

// Mock confirm box
const confirmBoxMock = vi.fn();
vi.stubGlobal('confirmBox',confirmBoxMock);

// Define global configuration for all test
const globalConfig = {
    global: {
        plugins: [vuetify4Test()],
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

const header = [{
    key: 'name',
    type: String,
    sort: true},{
    key: 'metabolite',
    type: String,
    sort: true},{
    key: 'date_create',
    type: String,
    sort: true},{
    key: 'date_archive',
    type: String,
    sort: true    
}]

// row of calibration curve
const calib_archi_0 = {
    name: 'calib1',
    metabolite: 'metab1',
    date_create: '2021-01-01',
    date_archive: '2021-01-02',
    used: true
}
const calib_libre_0 = {
    name: 'calib2',
    metabolite: 'metab2',
    date_create: '2021-01-02',
    date_archive: '',
    used: false
}
const calib_used_0 = {
    name: 'calib2',
    metabolite: 'metab2',
    date_create: '2021-01-02',
    date_archive: '',
    used: true
}


/** 
 * Check header of ManageCalibCurve
 * @param wrapper html wrapper
*/
function checkHeaders(wrapper: any){
    // check it displays the table
    expect(wrapper.findComponent({name: 'TableDbAction'}).exists()).toBe(true);
    // check it displays the headers
    expect(wrapper.text()).toContain('header.name');
    expect(wrapper.text()).toContain('header.metabolite');
    expect(wrapper.text()).toContain('header.date_create');
    expect(wrapper.text()).toContain('header.date_archive');
    // check it displays Add button
    expect(wrapper.text()).toContain('button.addview_show_calib_curve');
}

/** 
 * Check header of ManageCalibCurve not present
 * @param wrapper html wrapper
*/
function checkNotHeaders(wrapper: any){
    // check it doen't try to display the table
    expect(wrapper.findComponent({name: 'TableDbAction'}).exists()).toBe(false);
    expect(wrapper.text()).not.toContain('header.name');
    expect(wrapper.text()).not.toContain('header.metabolite');
    expect(wrapper.text()).not.toContain('header.date_create');
    expect(wrapper.text()).not.toContain('header.date_archive');
}

/**
 * check lines of CalibCurve table
 * @param wrapper html wrapper
 * @param calib Calibration curve information
 */
function checkLines(wrapper: any, calib: any){
    expect(wrapper.text()).toContain(calib.name);
    expect(wrapper.text()).toContain(calib.metabolite);
    expect(wrapper.text()).toContain(calib.date_create);
    expect(wrapper.text()).toContain(calib.date_archive);
}

/**
 * check lines of CalibCurve table not present
 * @param wrapper html wrapper
 * @param calib Calibration curve information
 */
function checkNotLines(wrapper: any, calib: any){
    expect(wrapper.text()).not.toContain(calib.name);
    expect(wrapper.text()).not.toContain(calib.metabolite);
    expect(wrapper.text()).not.toContain(calib.date_create);
    expect(wrapper.text()).not.toContain(calib.date_archive);
}

/**
 * Select line of calibration curve
 * @param wrapper html wrapper
 * @parem text contained text in line
 * @return html wrapper of line
 */
function selectLine(wrapper:any, text:string)
{
    // Select all lines of table
    const lines = wrapper.findAll('tr');
    if(lines.length > 0){
        return selectByText(lines, text);
    }

    return null;
    
}

/**
 * Check actions enables or not for free Cabration curve
 * @param wrapper html wrapper
 * @param calib Calibration curve information
 */
function checkActionFree(wrapper:any, calib:any)
{
    // Select line of Calibration Curve
    const line = selectLine(wrapper, calib.name);
    // Check we have this line
    expect(line.exists()).toBe(true);
    // Check all action are enable
    expect(line.find('.mdi-eye').exists()).toBe(true);
    expect(line.find('.mdi-pencil').exists()).toBe(true);
    expect(line.find('.mdi-archive').exists()).toBe(true);
    expect(line.find('.mdi-delete').exists()).toBe(true);
}
/**
 * Check actions enables or not for archived Cabration 
 * curve 
 * @param wrapper html wrapper
 * @param calib Calibration curve information
 */
function checkActionArchived(wrapper:any, calib:any)
{
    // Select line of Calibration Curve
    const line = selectLine(wrapper, calib.name);
    // Check we have this line
    expect(line.exists()).toBe(true);
    // Check only view action is enable
    expect(line.find('.mdi-eye').exists()).toBe(true);
    expect(line.find('.mdi-pencil').exists()).not.toBe(true);
    expect(line.find('.mdi-archive').exists()).not.toBe(true);
    expect(line.find('.mdi-delete').exists()).not.toBe(true);
}
/**
 * Check actions enables or not for used Cabration 
 * curve 
 * @param wrapper html wrapper
 * @param calib Calibration curve information
 */
function checkActionUsed(wrapper:any, calib:any)
{
    // Select line of Calibration Curve
    const line = selectLine(wrapper, calib.name);
    // Check we have this line
    expect(line.exists()).toBe(true);
    // Check only view and archive action are enable
    expect(line.find('.mdi-eye').exists()).toBe(true);
    expect(line.find('.mdi-pencil').exists()).not.toBe(true);
    expect(line.find('.mdi-archive').exists()).toBe(true);
    expect(line.find('.mdi-delete').exists()).not.toBe(true);
}
describe('ManageCalibCurve', () => {

    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        vi.resetAllMocks();
    })

    test.todo('disable calibration curve : no machine', async () => {
        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine not added
                    machineAdded: false,
                    // indicate mix added
                    mixAdded: true
                }
            }
        });

        await flushPromises();
        checkNotHeaders(wrapper);
        expect(wrapper.text()).toContain('message.disableCalibCurve');
        
    });

    test.todo('disable calibration curve : no mix', async () => {
        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine not added
                    machineAdded: true,
                    // indicate mix added
                    mixAdded: false
                }
            }
        });

        await flushPromises();
        checkNotHeaders(wrapper);
        expect(wrapper.text()).toContain('message.disableCalibCurve');
        
    });

    test.todo('disable calibration curve : no machine, no mix', async () => {
        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine not added
                    machineAdded: false,
                    // indicate mix added
                    mixAdded: false
                }
            }
        });

        await flushPromises();
        checkNotHeaders(wrapper);
        expect(wrapper.text()).toContain('message.disableCalibCurve');
        
    });

    test('No calibration curve', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url.includes('totalItems')) {
                return 0;
            }
            return header;
        });

        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig
        });

        await flushPromises();
        checkHeaders(wrapper);
        expect(wrapper.text()).toContain('message.noCalibCurve');
    });

    test('2 calibration curves: free and used', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url.includes('totalItems')) {
                return 2;
            } else if(url.includes('getPage')) {
                return [
                    calib_libre_0,
                    calib_used_0
                ]
            }

            return header;
        });

        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine added
                    machineAdded: true,
                    // indicate mix added
                    mixAdded: true
                }
            }
        });

        await flushPromises();
        checkHeaders(wrapper);
        checkLines(wrapper, calib_libre_0);
        checkActionFree(wrapper, calib_libre_0);
        checkLines(wrapper, calib_used_0);
        checkActionUsed(wrapper, calib_used_0);        
    });

    test('2 calibration curves: free and archived', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url.includes('totalItems')) {
                return 2;
            } else if(url.includes('getPage')) {
                return [
                    calib_libre_0,
                    calib_archi_0
                ]
            }

            return header;
        });

        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine added
                    machineAdded: true,
                    // indicate mix added
                    mixAdded: true
                }
            }
        });

        await flushPromises();
        checkHeaders(wrapper);
        checkLines(wrapper, calib_libre_0);
        checkActionFree(wrapper, calib_libre_0);
        checkLines(wrapper, calib_archi_0);
        checkActionArchived(wrapper, calib_archi_0);        
    });

    test('3 calibration curves: free, used, archived', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url.includes('totalItems')) {
                return 2;
            } else if(url.includes('getPage')) {
                return [
                    calib_libre_0,
                    calib_used_0,
                    calib_archi_0
                ]
            }

            return header;
        });

        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine added
                    machineAdded: true,
                    // indicate mix added
                    mixAdded: true
                }
            }
        });

        await flushPromises();
        checkHeaders(wrapper);
        checkLines(wrapper, calib_libre_0);
        checkActionFree(wrapper, calib_libre_0);
        checkLines(wrapper, calib_used_0);
        checkActionUsed(wrapper, calib_used_0);  
        checkLines(wrapper, calib_archi_0);
        checkActionArchived(wrapper, calib_archi_0); 
    });
    
    test.todo('Add calibration curve in empty table', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url.includes('totalItems')) {
                return 0;
            }
            return header;
        });

        const wrapper = mount(ManageCalibCurve,{
            ...globalConfig,
            data(){
                return {
                    // indicate machine added
                    machineAdded: true,
                    // indicate mix added
                    mixAdded: true
                }
            }
        });

        await flushPromises();
        // Click on add button
        await wrapper.find('.mdi-plus').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        
        // TODO: complet
    });

    test.todo("Add calibration curve in not empty table");
    test.todo('Archive a free calibration curve');
    test.todo('Archive a used calibration curve');
    test.todo('View a free calibration curve');
    test.todo('View a used calibration curve');
    test.todo('View a archived calibration curve');
    test.todo('Modify a free calibration curve');
    test.todo('Add empty calibration curve');
    test.todo('Add calibration curve with only a machine');
    test.todo('Add calibration curve with only a mix');
    test.todo('Add calibration curve with only a machine and a mix');
    test.todo('Add calibration curve with two mix only');
    test.todo('Add calibration curve with a machine and three mix');
    test.todo('Impossible to add daughter solution without machine and mix');
    test.todo('Impossible to add daughter solution without mix');
    test.todo('Impossible to add daughter solution without machine');
    test.todo('Impossible to add daughter solution from other machine');
    test.todo('Impossible to add daughter solution not from mix');
    test.todo('Add a daughter solution from three mix');
    test.todo('Impossible to add daughter solution from two mix');
    test.todo('Cancel add calibration curve');
    test.todo('Cancel delete calibration curve');
    test.todo('Cancel archive calibration curve');

});

