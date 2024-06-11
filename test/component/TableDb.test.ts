// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT
import { describe, test } from "vitest";
import TableDb from "~/components/TableDb.vue";
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from "@vue/test-utils";
import { mockNuxtImport} from '@nuxt/test-utils/runtime'

const { useI18nMock} = vi.hoisted(() => {
    return {
        useI18nMock: vi.fn(() => {
            return {t:(key:string) => key}
        }),
    }
  });
  
mockNuxtImport('useI18n', () => {
    return useI18nMock
})

// mock $fetch
const $fetchMock = vi.fn();
vi.stubGlobal('$fetch',$fetchMock);

describe("TableDb", async () => {

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();
    });

    test("unexist database table", async() => {
        $fetchMock.mockReturnValueOnce(Promise.reject("unexist"));

        const wrapper = await mountSuspended(TableDb,{
            props:{nameDbTable:"unexist"}
        });

        await flushPromises();
       
        expect(wrapper.html()).toContain("empty.");
    });

    test("Just show databse table empty", async() => {
        $fetchMock.mockImplementation((path:string) => {
            if(path.endsWith("totalItems")){
                return Promise.resolve(0)
            }
            return Promise.resolve([{
                key:"nameMock",
                type: "String",
                sortable: true}, {
                key:"ageMock",
                type: "Number",
                sortable: true}])
        });
        const wrapper = await mountSuspended(TableDb,{
            props:{nameDbTable:"users"}});

        await flushPromises();

        expect(wrapper.html()).toContain("header.nameMock");
        expect(wrapper.html()).toContain("header.ageMock");

    });

    test("Show database table with 2 lines", async() => {
        $fetchMock.mockImplementation((path:string) => {
            if(path.endsWith("totalItems")){
                return Promise.resolve(2)
            }
            if(path.endsWith("getPage")){
                return Promise.resolve([{nameMock:"name1",ageMock:1},
                    {nameMock:"name2",ageMock:2}])
            }
            return Promise.resolve([{
                key:"nameMock",
                type: "String",
                sortable: true}, {
                key:"ageMock",
                type: "Number",
                sortable: true}])
        });
        const wrapper = await mountSuspended(TableDb,{
            props:{nameDbTable:"users"}});

        await flushPromises();

        expect(wrapper.html()).toContain("header.nameMock");
        expect(wrapper.html()).toContain("header.ageMock");
        expect(wrapper.html()).toContain("name1");
        expect(wrapper.html()).toContain("name2");
        expect(wrapper.html()).toContain("1");
        expect(wrapper.html()).toContain("2");
    });
});

