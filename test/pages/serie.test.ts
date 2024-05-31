// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import { mount } from "@vue/test-utils";
import serie from "~/pages/serie.vue";
import useVuetify from "../extra/useVuetify";
import { mockComponent } from '@nuxt/test-utils/runtime';

// mock the layout
// Layout is empty
mockComponent('NuxtLayout', () => import("../extra/EmptyComponent.vue"));


describe("serie page", () =>{
    test.todo('showed default tab of serie page is serie tab', () => {
        const wrapper = mount(serie,{
            global:{
                plugins:[useVuetify()],
                
            }
        });

        expect(wrapper.findComponent("ManageSerieAsync").exists())
            .toBeTruthy();
        expect(wrapper.findComponent("ManageMachineAsync").exists())
            .toThrowError();
        expect(wrapper.findComponent("ManageBaseAsync").exists())
            .toThrowError();
        expect(wrapper.findComponent("ManageMixAsync").exists())
            .toThrowError();
        expect(wrapper.findComponent("ManageMoleculAsync").exists())
            .toThrowError();
        expect(wrapper.findComponent("ManageMotherAsync").exists())
            .toThrowError();
    })
});