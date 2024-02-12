// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import { mount } from "@vue/test-utils";
import TableDbAction from "~/components/TableDbAction.vue";

describe("TableDbAction", async () => {

    // document.body.innerHTML = "<div id=\"app\"></div>";

    test.todo("unexist database table");

    test("Just show databse table empty", () => {
        const wrapper = mount(TableDbAction, {
            // attachTo: document.getElementById("app") as HTMLElement,
            props:{
                nameDbTable: "project"
            }
        });

        // Check table showed
        expect(wrapper.find("table").isVisible()).toBe(true);
        expect(wrapper.find("thead").isVisible()).toBe(true);
        expect(wrapper.find("thead").text()).toBe("Nom Créé le  Équipe");
        // TODO not finish
    });

    test.todo("Show database table with 2 lines");
    test.todo("Case we just add action");
    test.todo("Case we add and delete action");
});
