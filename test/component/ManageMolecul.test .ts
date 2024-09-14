/** SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * 
 *  SPDX-License-Identifier: MIT
 * 
 * This file test the ManageMolecule component
*/
import { mount, config, flushPromises } from '@vue/test-utils';
import { expect, test, describe, vi } from 'vitest';
import { vuetify4Test } from '../extra/vuetify4Test';
import { selectByText } from '../extra/selectBy';
import ManageMolecule from '@/components/ManageMolecule.async.vue';

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
    key: 'ChEBI',
    type: String,
    sort: true},{
    key: 'equivalents',
    type: Number,
    sort: true 
}]

// row of molecule
const mol_0 = {
    id: '0',
    name: 'mol_0',
    ChEBI: "ChEBI:1234",
    equivalents: 2,
}
const mol_1 = {
    id: '1',
    name: 'mol_1',
    ChEBI: "ChEBI:1235",
    equivalents: 2,
}
const mol_2 = {
    id: '2',
    name: 'mol_2',
    ChEBI: "ChEBI:1236",
    equivalents: 0,
}
const mol_3 = {
    id: '3',
    name: 'mol_3',
    ChEBI: "ChEBI:0036",
    equivalents: 2,
}

// row of equivalents
const eq_0_1 = {
    id_mol_0: '0',
    id_mol_1: '1',
};
const eq_0_3 = {
    id_mol_0: '0',
    id_mol_1: '3',
};
const eq_1_3 = {
    id_mol_0: '1',
    id_mol_1: '3',
};

// row of synonyms
const syn_1 = {
    id_mol: '1',
    name: 'Other',
};

/** 
 * Check header of ManageMolecule
 * @param wrapper html wrapper
*/
function checkHeaders(wrapper: any){
    // check it displays the table
    expect(wrapper.findComponent({name: 'TableDbAction'}).exists()).toBe(true);
    // check it displays the headers
    expect(wrapper.text()).toContain('header.name');
    expect(wrapper.text()).toContain('header.ChEBI');
    expect(wrapper.text()).toContain('header.equivalents');
    // check it displays Add button
    expect(wrapper.text()).toContain('button.addview_show_molecule');
}

/**
 * check lines of Molecule table
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
function checkLines(wrapper: any, mol: any){
    expect(wrapper.text()).toContain(mol.name);
    expect(wrapper.text()).toContain(mol.ChEBI);
    expect(wrapper.text()).toContain(mol.equivalents);
}

/**
 * check lines of molCurve table not present
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
function checkNotLines(wrapper: any, mol: any){
    expect(wrapper.text()).not.toContain(mol.name);
    expect(wrapper.text()).not.toContain(mol.ChEBI);
    expect(wrapper.text()).not.toContain(mol.equivalents);
}

/**
 * Select line of Molecule
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
 * Check actions enables for Molecule
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
function checkAction(wrapper:any, mol:any)
{
    // Select line of Molecule
    const line = selectLine(wrapper, mol.name);
    // Check we have this line
    expect(line.exists()).toBe(true);
    // Check all action are enable
    expect(line.find('.mdi-eye').exists()).toBe(true);
    expect(line.find('.mdi-pencil').exists()).toBe(true);
}

/**
 * Check dialog openes to add Molecule
 * @param wrapper html wrapper
 */
async function checkAddDialog(wrapper:any){
    // Click on add button
    await wrapper.find('.mdi-plus').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    // Check dialog is open
    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    // Check dialog title
    expect(wrapper.text()).toContain('title.addMolecule');
    // Check dialog has a name field
    expect(wrapper.text()).toContain('label.nameMolecule');
}

/**
 * Check Module save
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
async function checkSave(wrapper:any, mol:any){
    // Click on save button
    await wrapper.find('button[name="saveMolecule"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();

    //check call API to save Molecule
    expect($fetchMock).toHaveBeenCalledWith('api/addMolecule',mol);

    // Check dialog is closed
    expect(wrapper.find('.v-dialog').exists()).toBe(false);

    // Check indicate Molecule is saved
    expect(successMock).toHaveBeenCalledWith('message.saveMolecule');
}

/**
 * Check dialog openes to modify Molecule
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
async function checkModifyDialog(wrapper:any, mol:any){
    // Select line of Molecule
    const line = selectLine(wrapper, mol.name);
    // Click on modify button
    await line.find('.mdi-pencil').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    // Check dialog is open
    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    // Check dialog title
    expect(wrapper.text()).toContain('title.modifyMolecule');
    // Check dialog has a name field
    expect(wrapper.text()).toContain('label.nameMolecule');
    // Check dialog has a molecule name
    expect(wrapper.find('input[name="nameMolecule"]').element.value).toBe(mol.name);
    // Check can't modify molecule name
    expect(wrapper.find('input[name="nameMolecule"]').attributes('disabled')).toBe('disabled');
}

/**
 * Check view dialog openes to view Molecule
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
async function checkViewDialog(wrapper:any, mol:any){
    // Select line of Molecule
    const line = selectLine(wrapper, mol.name);
    // Click on view button
    await line.find('.mdi-eye').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    // Check dialog is open
    expect(wrapper.find('.v-dialog').exists()).toBe(true);
    // Check dialog title
    expect(wrapper.text()).toContain('title.viewMolecule');
    // Check dialog has a name field
    expect(wrapper.text()).toContain('label.nameMolecule');
    // Check dialog has a molecule name
    expect(wrapper.find('input[name="nameMolecule"]').element.value).toBe(mol.name);
    // Check can't modify molecule name
    expect(wrapper.find('input[name="nameMolecule"]').attributes('disabled')).toBe('disabled');
    // Check Name of Molecule
    expect(wrapper.text()).toContain(mol.name);
    // Check ChEBI of Molecule
    expect(wrapper.text()).toContain(mol.ChEBI);

    // Check dialog hasn't table
    expect(wrapper.find('.v-table').exists()).toBe(false);

    // Check dialog hasn't input instead of name
    expect(wrapper.findAll('input').length).toBe(1);

}

/**
 * Check Module modify
 * @param wrapper html wrapper
 * @param mol Molecule information
 */
async function checkModif(wrapper:any, mol:any){
    // Click on save button
    await wrapper.find('button[name="saveMolecule"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();

    //check call API to save Molecule
    expect($fetchMock).toHaveBeenCalledWith('api/modifMolecule',mol);

    // Check dialog is closed
    expect(wrapper.find('.v-dialog').exists()).toBe(false);

    // Check indicate Molecule is saved
    expect(successMock).toHaveBeenCalledWith('message.saveMolecule');
}

describe('ManageMolecule', () => {

    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        vi.resetAllMocks();

        // reset global variables
        mol_0.equivalents = 2;
        mol_1.equivalents = 2;
        mol_2.equivalents = 0;
        mol_3.equivalents = 2;
    })

    test('No Molecule', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 0;
            }
            return header;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig
        });

        await flushPromises();
        checkHeaders(wrapper);
        expect(wrapper.text()).toContain('message.noMolecule');
    });

    test('2 Molecules', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 2;
            } else if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1
                ]
            }

            return header;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });

        await flushPromises();
        checkHeaders(wrapper);
        checkLines(wrapper, mol_0);
        checkAction(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkAction(wrapper, mol_1);        
    });

    test('Add Molecule in empty table, with synonym', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 0;
            }
            if(url === 'api/getChEBI?search=epichlicin') {
                return {chebi: 'ChEBI:65849',
                        name: 'epichlicin',
                        formular: 'C48H74N12O14'};
            }
            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();
        await checkAddDialog(wrapper);

        // Add name
        await wrapper.find('input[name="nameMolecule"]').
            setValue('epichlicin ');
        // Check call API to request ChEBI
        expect($fetchMock).toHaveBeenCalledWith('api/getChEBI?search=epichlicin');
        // Check table to select ChEBI display
        expect(wrapper.find('.v-table').exists()).toBe(true);
        // Get table
        const table = wrapper.find('.v-table');
        // Check table has one line
        expect(table.findAll('tr').length).toBe(1);
        // Check name of Molecule
        expect(table.text()).toContain('epichlicin');
        // Check formular of Molecule
        expect(table.text()).toContain('C48H74N12O14');
        // Select Molecule
        await table.find('tr').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('epichlicin - C48H74N12O14');

        // Check dialog has a no equivalents zone
        expect(wrapper.text()).toContain('label.equivalents');
        // Check message of no equivalents
        expect(wrapper.text()).toContain('message.noEquivalents');
        // Check dialog hasn't a equivalents field
        expect(wrapper.find('input[name="equivalents"]').exists()).toBe(false);

        // Check dialog has a synonyms zone
        expect(wrapper.text()).toContain('label.synonyms');
        // Check synonyms field
        expect(wrapper.find('input[name="synonyms"]').exists()).toBe(true);
        // Add synonyms
        await wrapper.find('input[name="synonyms"]').setValue('CinCin');
        // Click on add button
        await wrapper.find('button[name="addSynonyms"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are added
        expect(wrapper.text()).toContain('CinCin');

        // Save Molecule
        checkSave(wrapper, {name: 'epichlicin', ChEBI: 'ChEBI:65849', equivalents: 0, synonyms: ['CinCin']});

    });

    test("Add Molecule in not empty table, just molecule", async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url=== 'api/manageControle/totalItems') {
                return 2;
            } else if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                ]
            }
            if(url === 'api/getChEBI?search=epichlicin') {
                return {chebi: 'ChEBI:65849',
                        name: 'epichlicin',
                        formular: 'C48H74N12O14'};
            }
            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();
        // Open dialog to add Molecule
        checkAddDialog(wrapper);
        // Add name
        await wrapper.find('input[name="nameMolecule"]').
            setValue('epichlicin ');
        // Check table to select ChEBI display
        expect(wrapper.find('.v-table').exists()).toBe(true);
        // Get table
        const table = wrapper.find('.v-table');
        // Check table has one line
        expect(table.findAll('tr').length).toBe(1);
        // Check name of Molecule
        expect(table.text()).toContain('epichlicin');
        // Check formular of Molecule
        expect(table.text()).toContain('C48H74N12O14');
        // Select Molecule
        await table.find('tr').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('epichlicin - C48H74N12O14');

        // Check dialog has a equivalents zone
        expect(wrapper.text()).toContain('label.equivalents');
        // Check equivalents field
        expect(wrapper.find('input[name="equivalents"]').exists()).toBe(true);
        // Add equivalents
        await wrapper.find('input[name="equivalents"]').setValue('mol');
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);
       
        // Save Molecule
        checkSave(wrapper, {
            name: 'epichlicin',
            ChEBI: 'ChEBI:65849',
            equivalents: 0,
        });

        // Check other molecules aren't modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        
    });

    test("Add Molecule in not empty table with equivalents", async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 3;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2
                ]
            }
            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();
        // Open dialog to add Molecule
        checkAddDialog(wrapper);
        // Add name
        await wrapper.find('input[name="nameMolecule"]').
            setValue('epichlicin ');
        // Check table to select ChEBI display
        expect(wrapper.find('.v-table').exists()).toBe(true);
        // Get table
        const table = wrapper.find('.v-table');
        // Check table has one line
        expect(table.findAll('tr').length).toBe(1);
        // Check name of Molecule
        expect(table.text()).toContain('epichlicin');
        // Check formular of Molecule
        expect(table.text()).toContain('C48H74N12O14');
        // Select Molecule
        await table.find('tr').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('epichlicin - C48H74N12O14');

        // Check dialog has a equivalents zone
        expect(wrapper.text()).toContain('label.equivalents');
        // Check equivalents field
        expect(wrapper.find('input[name="equivalents"]').exists()).toBe(true);
        // Add equivalents
        await wrapper.find('input[name="equivalents"]').setValue('mol');
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);
        // Get table
        const tableEq = wrapper.findAll('.v-table')[1];
        // Check table has three line
        expect(tableEq.findAll('tr').length).toBe(3);
        // Check name of Molecule
        expect(tableEq.text()).toContain('mol_0');
        expect(tableEq.text()).toContain('mol_1');
        expect(tableEq.text()).toContain('mol_2');
        // Select Molecule
        await tableEq.findAll('tr')[2].trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('mol_2');
        expect(wrapper.find('.mdi-delete').exists()).toBe(true);
        expect(wrapper.findAll('.mdi-plus').length).toBe(1);

        checkSave(wrapper, {
            name: 'epichlicin',
            ChEBI: 'ChEBI:65849',
            equivalents: 1,
        });

        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    {
                        name: 'epichlicin',
                        ChEBI: 'ChEBI:65849',
                        equivalents: 1,
                    }
                ]
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });
        // Check equivalent to Mol_2 are added
        checkLines(wrapper, {
            name: 'mol_2',
            ChEBI: 'ChEBI:1236',
            equivalents: 1,
        });

        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
        
    });
    test('View a Molecule', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    eq_0_1,
                    eq_0_3,
                    eq_1_3
                ]
            }
            if(url === 'api/getSynonyms') {
                return [
                    syn_1
                ]
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // View Molecule
        checkViewDialog(wrapper, mol_1);
        
        // Check equivalents section
        expect(wrapper.text()).toContain('label.equivalents');

        // Check we have 2 equivalents
        expect(wrapper.text()).toContain('mol_0');
        expect(wrapper.text()).toContain('mol_3');

        // Check synonyms section
        expect(wrapper.text()).toContain('label.synonyms');
        // Check we have 1 synonyms
        expect(wrapper.text()).toContain('Other');

        // close dialog
        await wrapper.find('.mdi-close').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check dialog is closed
        expect(wrapper.find('.v-dialog').exists()).toBe(false);

        // Check any molecule hasn't been modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
        checkLines(wrapper, mol_3);
    });

    test('Modify a Molecule, add synonyms', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    eq_0_1,
                    eq_0_3,
                    eq_1_3
                ]
            }
            if(url === 'api/getSynonyms') {
                return [];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_1);
        // Add synonyms
        await wrapper.find('input[name="synonyms"]').setValue('Other');
        // Click on add button
        await wrapper.find('button[name="addSynonyms"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are added
        expect(wrapper.text()).toContain('Other');
        // Check add delete button
        // 3 because we have 2 equivalents and 1 synonyms
        expect(wrapper.findAll('.mdi-delete').length).toBe(3);

        // Save Molecule
        checkSave(wrapper, mol_1);

        // Check other molecules aren't modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
        checkLines(wrapper, mol_3);
    });
    test('Modify a Molecule, add equivalents',async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    eq_0_1,
                    eq_0_3,
                    eq_1_3
                ]
            }
            if(url === 'api/getSynonyms') {
                return [];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_2);
        // Add equivalents
        await wrapper.find('input[name="equivalents"]').setValue('mol');
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);
        // Get table
        const tableEq = wrapper.findAll('.v-table')[1];
        // Check table has three line
        expect(tableEq.findAll('tr').length).toBe(3);
        // Check name of Molecule
        expect(tableEq.text()).toContain('mol_0');
        expect(tableEq.text()).toContain('mol_1');
        expect(tableEq.text()).toContain('mol_3');
        expect(tableEq.text()).not.toContain('mol_4');
        // Select Molecule
        await tableEq.findAll('tr')[2].trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('mol_2');
        expect(wrapper.find('.mdi-delete').exists()).toBe(true);
        expect(wrapper.findAll('.mdi-plus').length).toBe(1);

        // Save Molecule
        checkModif(wrapper, {
            name: 'mol_2',
            ChEBI: 'ChEBI:1236',
            equivalents: 1,
        });

        // Check other molecules are modified
        mol_0.equivalents++;
        mol_1.equivalents++;
        mol_2.equivalents++;
        mol_3.equivalents++;

        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
    });
    test('Modify a Molecule, add synonyms and equivalents', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    eq_0_1,
                    eq_0_3,
                    eq_1_3
                ]
            }
            if(url === 'api/getSynonyms') {
                return [];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_2);
        // Add equivalents
        await wrapper.find('input[name="equivalents"]').setValue('mol');
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);
        // Get table
        const tableEq = wrapper.findAll('.v-table')[1];
        // Check table has three line
        expect(tableEq.findAll('tr').length).toBe(3);
        // Check name of Molecule
        expect(tableEq.text()).toContain('mol_0');
        expect(tableEq.text()).toContain('mol_1');
        expect(tableEq.text()).toContain('mol_3');
        expect(tableEq.text()).not.toContain('mol_4');
        // Select Molecule
        await tableEq.findAll('tr')[2].trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check Molecule is selected
        expect(wrapper.text()).toContain('mol_2');
        expect(wrapper.find('.mdi-delete').exists()).toBe(true);
        expect(wrapper.findAll('.mdi-plus').length).toBe(1);

        // Add synonyms
        await wrapper.find('input[name="synonyms"]').setValue('Other');
        // Click on add button
        await wrapper.find('button[name="addSynonyms"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are added
        expect(wrapper.text()).toContain('Other');
        // Check add delete button
        // 2 because we have 1 equivalents and 1 synonyms
        expect(wrapper.findAll('.mdi-delete').length).toBe(2);

        // Save Molecule
        checkModif(wrapper, {
            name: 'mol_2',
            ChEBI: 'ChEBI:1236',
            equivalents: 1,
        });

        // Check other molecules are modified
        mol_0.equivalents++;
        mol_1.equivalents++;
        mol_2.equivalents++;
        mol_3.equivalents++;

        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
    });
    test('Modify a Molecule, remove synonyms', async () => {
        mol_0.equivalents++;
        mol_1.equivalents++;
        mol_2.equivalents++;
        mol_3.equivalents++;
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    {
                        id_mol_0: '0',
                        id_mol_1: '2',
                    },
                    {
                        id_mol_0: '1',
                        id_mol_1: '2',
                    },
                    {
                        id_mol_0: '3',
                        id_mol_1: '2',
                    }
                ]
            }
            if(url === 'api/getSynonyms') {
                return ["Other"];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_2);
        // Check have equivalents input
        expect(wrapper.find('input[name="equivalents"]').exists()).toBe(true);
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);

        // Check we have 3 equivalents
        expect(wrapper.text()).toContain('mol_0');
        expect(wrapper.text()).toContain('mol_1');
        expect(wrapper.text()).toContain('mol_3');
        // 4 = 3 equivalents + 1 synonyms
        expect(wrapper.findAll('.mdi-delete').length).toBe(4);

        // Check we have 1 synonyms
        expect(wrapper.text()).toContain('Other');
        // Remove synonyms
        await wrapper.findAll('.mdi-delete')[3].trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are removed
        expect(wrapper.text()).not.toContain('Other');
        // 3 = 3 equivalents
        expect(wrapper.findAll('.mdi-delete').length).toBe(3);

        // Save Molecule
        checkModif(wrapper, {
            name: 'mol_2',
            ChEBI: 'ChEBI:1236',
            equivalents: 1,
        });

        // Check other molecules are modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
    });

    test('Modify a Molecule, remove synonyms and equivalents',async () => {
        mol_0.equivalents++;
        mol_1.equivalents++;
        mol_2.equivalents++;
        mol_3.equivalents++;
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    {
                        id_mol_0: '0',
                        id_mol_1: '2',
                    },
                    {
                        id_mol_0: '1',
                        id_mol_1: '2',
                    },
                    {
                        id_mol_0: '3',
                        id_mol_1: '2',
                    }
                ]
            }
            if(url === 'api/getSynonyms') {
                return ["Other"];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_2);
        // Check have equivalents input
        expect(wrapper.find('input[name="equivalents"]').exists()).toBe(true);
        // Check have table to select equivalents
        expect(wrapper.findAll('.v-table')[1].exists()).toBe(true);

        // Check we have 3 equivalents
        expect(wrapper.text()).toContain('mol_0');
        expect(wrapper.text()).toContain('mol_1');
        expect(wrapper.text()).toContain('mol_3');
        // 4 = 3 equivalents + 1 synonyms
        expect(wrapper.findAll('.mdi-delete').length).toBe(4);

        // simulate fetch delete equivalents
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/deleteEquivalents') {
                return [];
            }
            return 0;
        });

        // Delete equivalents
        await wrapper.findAll('.mdi-delete')[2].trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check call API to delete equivalents
        expect($fetchMock).toHaveBeenCalledWith('api/deleteEquivalents', {id_mol_0: '3', id_mol_1: '2'});

        // Check equivalents are removed
        expect(wrapper.text()).not.toContain('mol_0');
        expect(wrapper.text()).not.toContain('mol_1');
        expect(wrapper.text()).not.toContain('mol_3');


        // Check we have 1 synonyms
        expect(wrapper.text()).toContain('Other');

        // Simulate fetch delete synonyms
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/deleteSynonyms') {
                return [];
            }
            return 0;
        });

        // Remove synonyms
        await wrapper.find('.mdi-delete').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are removed
        expect(wrapper.text()).not.toContain('Other');
        expect(wrapper.findAll('.mdi-delete').length).toBe(0);

        // Check call API to delete synonyms
        expect($fetchMock).toHaveBeenCalledWith('api/deleteSynonyms', {id_mol: '2', synonyms: 'Other'});


        // remettre les molecules au velur initale et vérifier
        mol_0.equivalents--;
        mol_1.equivalents--;
        mol_2.equivalents--;
        mol_3.equivalents--;

        // Save Molecule
        checkModif(wrapper, mol_2);

        // Check other molecules are modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
        checkLines(wrapper, mol_3);

    });

    test('Cancel modification of Molecule', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url === 'api/manageControle/totalItems') {
                return 4;
            } 
            if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                    mol_2,
                    mol_3
                ]
            }
            if(url === 'api/getEquivalents') {
                return [
                    eq_0_1,
                    eq_0_3,
                    eq_1_3
                ]
            }
            if(url === 'api/getSynonyms') {
                return [];
            }

            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Modify Molecule
        checkModifyDialog(wrapper, mol_1);
        // Add synonyms
        await wrapper.find('input[name="synonyms"]').setValue('Other');
        // Click on add button
        await wrapper.find('button[name="addSynonyms"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();
        // Check synonyms are added
        expect(wrapper.text()).toContain('Other');
        // Check add delete button
        // 3 because we have 2 equivalents and 1 synonyms
        expect(wrapper.findAll('.mdi-delete').length).toBe(3);

        // Cancel Modification
        await wrapper.find('.mdi-close').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is open
        expect(wrapper.find('.confirm-box').exists()).toBe(true);
        // Cancel confirm dialog
        await wrapper.find('bt[name="btNo"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is closed
        expect(wrapper.find('.confirm-box').exists()).toBe(false);

        // Cancel Modification
        await wrapper.find('.mdi-close').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is open
        expect(wrapper.find('.confirm-box').exists()).toBe(true);
        // Confirm confirm dialog
        await wrapper.find('bt[name="btYes"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check dialog is closed
        expect(wrapper.find('.v-dialog').exists()).toBe(false);

        // Check any molecules aren't modified 
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);
        checkLines(wrapper, mol_2);
        checkLines(wrapper, mol_3);       
    });

    test('Cancel add Molecule', async () => {
        // Mock fetch
        $fetchMock.mockImplementation(async (url: string) => {
            if(url=== 'api/manageControle/totalItems') {
                return 2;
            } else if(url === 'api/manageControle/getPage') {
                return [
                    mol_0,
                    mol_1,
                ]
            }
            if(url === 'api/getChEBI?search=epichlicin') {
                return {chebi: 'ChEBI:65849',
                        name: 'epichlicin',
                        formular: 'C48H74N12O14'};
            }
            if(url === 'api/manageControle/header') {
                return header;
            }
            return 0;
        });

        const wrapper = mount(ManageMolecule,{
            ...globalConfig,
        });
        await flushPromises();

        // Open dialog to add Molecule
        checkAddDialog(wrapper);

        // Cancel add Molecule
        await wrapper.find('.mdi-close').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is open
        expect(wrapper.find('.confirm-box').exists()).toBe(true);
        // Cancel confirm dialog
        await wrapper.find('bt[name="btNo"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is closed
        expect(wrapper.find('.confirm-box').exists()).toBe(false);

        // Cancel add Molecule
        await wrapper.find('.mdi-close').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check confirm dialog is open
        expect(wrapper.find('.confirm-box').exists()).toBe(true);
        // Confirm confirm dialog
        await wrapper.find('bt[name="btYes"]').trigger('click');
        await wrapper.vm.$nextTick();
        await flushPromises();

        // Check dialog is closed
        expect(wrapper.find('.v-dialog').exists()).toBe(false);

        // Check any molecules aren't modified
        checkLines(wrapper, mol_0);
        checkLines(wrapper, mol_1);

    });
});

