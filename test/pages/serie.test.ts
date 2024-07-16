// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import calibCurve from "~/pages/calibCurve.vue";
import { mockComponent,mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from "@vue/test-utils";

// Function to mock a component
/**
 * create a component with a div with the class name
 * @param name name of the component
 * @returns component with a div with the class name
 */
function mockComponentName(name: string) {
    return defineComponent({
        setup() {
            return () => h('div', { class: name })
        }
    })
}
// mock the layout
// Layout is empty
mockComponent('NuxtLayout', () => import("../extra/EmptyComponent.vue"));
// mock the component
mockComponent('ManageCalibCurveAsync', () => mockComponentName('ManageCalibCurveAsync'));
mockComponent('ManageMachineAsync', 
              () => mockComponentName('ManageMachineAsync'));
mockComponent('ManageBaseAsync', () => mockComponentName('ManageBaseAsync'));
mockComponent('ManageMixAsync', () => mockComponentName('ManageMixAsync'));
mockComponent('ManageMoleculeAsync', 
              () => mockComponentName('ManageMoleculeAsync'));
mockComponent('ManageMotherAsync',
              () => mockComponentName('ManageMotherAsync'));

// function to check if the component is loaded
/**
 * check if the component is loaded
 * @param wrapper wrapper of the page
 * @param contain list of component that should be loaded
 * @param notContain list of component that should not be loaded
 */
function checkLoadComponent(wrapper: any, 
                            contain: string[], notContain: string[]) {
    const html = wrapper.html();
    // check if the component is loaded
    contain.forEach((element) => {
        expect(html).toContain(element);
    });
    // check if the component is not loaded
    notContain.forEach((element) => {
        expect(html).not.toContain(element);
    });
}

// Fucntion check get great component activated
/**
 * check if the component is activated
 * @param wrapper wrapper of the page
 * @param activated name of the activated component
 */
function checkActivated (wrapper: any, activated: string) {
    // check if only one tab is activated
    expect(wrapper.findAll(`.v-window-item--active`)).toHaveLength(1);
    // get the activated tab
    const tabActivated = wrapper.find(`.v-window-item--active`);
    // check if the activated tab is the right one
    expect(tabActivated.html()).toContain(activated);
}

describe("calibration curve page", () =>{
    test('showed default tab of calibration curve page is calibration curve tab', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check if the calibration curve tab is loaded
        checkLoadComponent(wrapper, 
              ["ManageCalibCurveAsync"],
              ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");
        
    });

    test('load machine tab after a click', async() => {

        const wrapper = await mountSuspended(calibCurve);
        
        // check default display
        checkLoadComponent(wrapper,
                ["ManageCalibCurveAsync"],
                ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");

        // click on the machine tab
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();

        // check if the machine tab is loaded
        checkLoadComponent(wrapper,
              ["ManageCalibCurveAsync", "ManageMachineAsync"],
              ["ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve, machine tab is activated
        checkActivated(wrapper, "ManageMachineAsync");
    });

    test('load machine tab after two click', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check default display
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");

        // click on the machine tab
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        // click on the mix tab
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();

        // check if the machine and mix tab are loaded
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync", "ManageMachineAsync", "ManageMixAsync"],
            ["ManageBaseAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        // check if only the calibration curve, mix tab is activated
        checkActivated(wrapper, "ManageMixAsync");

    })

    test('load machine tab after three click', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check default display    
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");

        // click on the machine tab
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        // click on the molecule tab
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        // click on the base tab
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();

        // check if only the calibration curve, machine, molecule and base tab are loaded
        checkLoadComponent(wrapper,
              ["ManageCalibCurveAsync", "ManageMachineAsync", "ManageMoleculeAsync",
               "ManageBaseAsync"],
              ["ManageMixAsync", "ManageMotherAsync"]);
        
        // check if only the base tab is activated
        checkActivated(wrapper, "ManageBaseAsync");

    })

    test('load machine tab after four click', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check default display
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");

        // click on the mother tab
        await wrapper.find(`[value="mother"]`).trigger('click');
        await flushPromises();
        // click on the mix tab
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();
        // click on the base tab
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();
        // click on the molecule tab
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();

        // check if only the calibration curve, mother, mix, base and molecule tab are
        // loaded
        checkLoadComponent(wrapper,
              ["ManageCalibCurveAsync", "ManageMoleculeAsync",
               "ManageBaseAsync", "ManageMixAsync", "ManageMotherAsync"],
              ["ManageMachineAsync"]);
        // check if only the molecule tab is activated
        checkActivated(wrapper, "ManageMoleculeAsync");
    })

    test('load machine tab after click all tab', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check default display
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");

        // click on the mother tab
        await wrapper.find(`[value="mother"]`).trigger('click');
        await flushPromises();
        // click on the mix tab
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();
        // click on the machine tab
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        // click on the base tab
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();
        // click on the molecule tab
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        // check if all tab are loaded
        checkLoadComponent(wrapper,
              [ "ManageCalibCurveAsync", "ManageMoleculeAsync","ManageMachineAsync",
               "ManageBaseAsync", "ManageMixAsync", "ManageMotherAsync"],
              []);
        // check if only the molecule tab is activated
        checkActivated(wrapper, "ManageMoleculeAsync");

    })

    test('click a second time a tab', async() => {

        const wrapper = await mountSuspended(calibCurve);
        // check default display
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        // check if only the calibration curve tab is activated
        checkActivated(wrapper, "ManageCalibCurveAsync");
        
        // click on the machine tab
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        // click on the molecule tab
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        // click on the base tab
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();

        // check if only the calibration curve, machine, molecule and base tab are loaded
        checkLoadComponent(wrapper,
              ["ManageCalibCurveAsync", "ManageMachineAsync", "ManageMoleculeAsync",
               "ManageBaseAsync"],
              ["ManageMixAsync", "ManageMotherAsync"]);
        // check if only the base tab is activated
        checkActivated(wrapper, "ManageBaseAsync");
        // click again on the base tab
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        // check if only the calibration curve, machine, molecule and base tab are loaded
        checkLoadComponent(wrapper,
            ["ManageCalibCurveAsync", "ManageMachineAsync", "ManageMoleculeAsync",
             "ManageBaseAsync"],
            ["ManageMixAsync", "ManageMotherAsync"]);
        // check if only the molecule tab is activated
        checkActivated(wrapper, "ManageMoleculeAsync");
    })
}); 