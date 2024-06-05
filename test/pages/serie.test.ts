// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import serie from "~/pages/serie.vue";
import { mockComponent,mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from "@vue/test-utils";

// Function to mock a component
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
mockComponent('ManageSerieAsync', () => mockComponentName('ManageSerieAsync'));
mockComponent('ManageMachineAsync', () => mockComponentName('ManageMachineAsync'));
mockComponent('ManageBaseAsync', () => mockComponentName('ManageBaseAsync'));
mockComponent('ManageMixAsync', () => mockComponentName('ManageMixAsync'));
mockComponent('ManageMoleculeAsync', () => mockComponentName('ManageMoleculeAsync'));
mockComponent('ManageMotherAsync', () => mockComponentName('ManageMotherAsync'));

// function to check if the component is loaded
function checkLoadComponent(wrapper: any, 
                            contain: string[], notContain: string[]) {
    const html = wrapper.html();
    contain.forEach((element) => {
        expect(html).toContain(element);
    });
    notContain.forEach((element) => {
        expect(html).not.toContain(element);
    });
}

// Fucntion check get great component activated
function checkActivated (wrapper: any, activated: string) {
    
    expect(wrapper.findAll(`.v-window-item--active`)).toHaveLength(1);
    const tabActivated = wrapper.find(`.v-window-item--active`);
    expect(tabActivated.html()).toContain(activated);
}

describe("serie page", () =>{
    test('showed default tab of serie page is serie tab', async() => {

        const wrapper = await mountSuspended(serie);
        
        checkLoadComponent(wrapper, 
              ["ManageSerieAsync"],
              ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");
        
    });

    test('load machine tab after a click', async() => {

        const wrapper = await mountSuspended(serie);
        
        checkLoadComponent(wrapper,
                ["ManageSerieAsync"],
                ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        
        checkActivated(wrapper, "ManageSerieAsync");

        const bt = wrapper.find(`[value="machine"]`);
        
        await bt.trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
              ["ManageSerieAsync", "ManageMachineAsync"],
              ["ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);
        
        checkActivated(wrapper, "ManageMachineAsync");
    });

    test('load machine tab after two click', async() => {

        const wrapper = await mountSuspended(serie);
        checkLoadComponent(wrapper,
            ["ManageSerieAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");

        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
            ["ManageSerieAsync", "ManageMachineAsync", "ManageMixAsync"],
            ["ManageBaseAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageMixAsync");

    })

    test('load machine tab after three click', async() => {

        const wrapper = await mountSuspended(serie);

        checkLoadComponent(wrapper,
            ["ManageSerieAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");

        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
              ["ManageSerieAsync", "ManageMachineAsync", "ManageMoleculeAsync",
               "ManageBaseAsync"],
              ["ManageMixAsync", "ManageMotherAsync"]);
        
        checkActivated(wrapper, "ManageBaseAsync");

    })

    test('load machine tab after four click', async() => {

        const wrapper = await mountSuspended(serie);

        checkLoadComponent(wrapper,
            ["ManageSerieAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");

        await wrapper.find(`[value="mother"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
              ["ManageSerieAsync", "ManageMoleculeAsync",
               "ManageBaseAsync", "ManageMixAsync", "ManageMotherAsync"],
              ["ManageMachineAsync"]);
    
        checkActivated(wrapper, "ManageMoleculeAsync");
    })

    test('load machine tab after click all tab', async() => {

        const wrapper = await mountSuspended(serie);

        checkLoadComponent(wrapper,
            ["ManageSerieAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");

        await wrapper.find(`[value="mother"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="mix"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
              [ "ManageSerieAsync", "ManageMoleculeAsync","ManageMachineAsync",
               "ManageBaseAsync", "ManageMixAsync", "ManageMotherAsync"],
              []);

        checkActivated(wrapper, "ManageMoleculeAsync");

    })

    test('click a second time a tab', async() => {

        const wrapper = await mountSuspended(serie);

        checkLoadComponent(wrapper,
            ["ManageSerieAsync"],
            ["ManageMachineAsync", "ManageBaseAsync", "ManageMixAsync", "ManageMoleculeAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageSerieAsync");

        await wrapper.find(`[value="machine"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();
        await wrapper.find(`[value="base"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
              ["ManageSerieAsync", "ManageMachineAsync", "ManageMoleculeAsync",
               "ManageBaseAsync"],
              ["ManageMixAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageBaseAsync");

        await wrapper.find(`[value="molecule"]`).trigger('click');
        await flushPromises();

        checkLoadComponent(wrapper,
            ["ManageSerieAsync", "ManageMachineAsync", "ManageMoleculeAsync",
             "ManageBaseAsync"],
            ["ManageMixAsync", "ManageMotherAsync"]);

        checkActivated(wrapper, "ManageMoleculeAsync");
    })
}); 