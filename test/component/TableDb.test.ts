// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT
import { describe, test } from "vitest";
import TableDb from "~/components/TableDb.vue";
import { render, waitFor } from "@testing-library/vue";
describe("TableDb", async () => {

    test.todo("unexist database table");

    test("Just show databse table empty", async() => {
        const wrapper = render(TableDb,{props:{nameDbTable:"users"}});

        console.log(wrapper.html());
        // Wait for the component to update after data is fetched
        await waitFor(() => wrapper.getByText("name"));

        console.log(wrapper.html());
        expect(await wrapper.findByText("name")).toBeInstanceOf(HTMLElement);

    });

    test.todo("Show database table with 2 lines");
});

