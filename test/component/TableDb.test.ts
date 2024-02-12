// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import TableDb from "~/components/TableDb.vue";

describe("TableDb", async () => {

    document.body.innerHTML = `
  <div>
    <h1>Pas une app Vue</h1>
    <div id="app"></div>
  </div>
`;

    test.todo("unexist database table");

    test("Just show databse table empty", async() => {
        const wrapper = mount(TableDb, {
            // attachTo: document.getElementById("app") as HTMLElement,
            props:{
                nameDbTable: "project"
            }
        });
        await flushPromises();
        // console.log((await document.body.innerHTML), "plouf");
        const res = await wrapper.find("div");
        console.log(res,"uhukh");
        console.log(wrapper,"000000");
        
        
        // Check table showed
        expect(res.isVisible()).toBe(true);
        expect(wrapper.find("thead").isVisible()).toBe(true);
        expect(wrapper.find("thead").text()).toBe("Nom Créé le  Équipe");
        // TODO not finish
    });

    test.todo("Show database table with 2 lines");

});
