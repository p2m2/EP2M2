import { mount } from '@vue/test-utils';
import { expect, test, describe } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import defaultLayout from '~/layouts/default.vue';

const vuetify = createVuetify({
  components,
  directives,
});

global.ResizeObserver = require('resize-observer-polyfill');

// Verify default display of layout
describe('default layout: default render',() => {
  // default display of banner image
  test('default image banner', () => {
    const wrapper = mount(defaultLayout, {
      props: {},
      global: {
        plugins: [vuetify],
      }
    });
    //  check if image is here
    expect(wrapper.find('.bannerImage').exists()).toBeTruthy();
    const partImg = wrapper.find('.bannerImage');
    // Check alt message
    expect(partImg.html()).toContain("icône P2M2");
    expect(partImg.html()).toContain("Accueil");    
  });

  // Verify default display of lang button
  test('default lang button', () => {
    const wrapper = mount(defaultLayout, {
      props: {},
      global: {
        plugins: [vuetify],
      }
    });
    // check we have lang button
    expect(wrapper.find('.bt-lang').exists()).toBeTruthy();
    const partLang = wrapper.find('.bt-lang');
    // check we import translate icon
    expect(partLang.html()).toContain("translate");
    expect(partLang.html()).toContain("Changer de langue");
  });

  // Verify default display of help button
  test('default help button', () => {
    const wrapper = mount(defaultLayout, {
      props: {},
      global: {
        plugins: [vuetify],
      }
    });
    //  Check we have help button
    expect(wrapper.find('.bt-help').exists()).toBeTruthy();
    const partLang = wrapper.find('.bt-help');
    // Check we import help icon
    expect(partLang.html()).toContain("help");
    expect(partLang.html()).toContain("Aide");
  });

  // Verify default display of logout button
  test('default logout button', () => {
    const wrapper = mount(defaultLayout, {
      props: {},
      global: {
        plugins: [vuetify],
      }
    });
    // Check we have logout button
    expect(wrapper.find('.bt-logout').exists()).toBeTruthy();
    const partLang = wrapper.find('.bt-logout');
    // Check we import logout icon
    expect(partLang.html()).toContain("logout");
    expect(partLang.html()).toContain("Déconnexion");    
  });

  // Check alt change when lang changing
  test.todo("change Lang", async () => {
    const wrapper = mount(defaultLayout,{
      global: {
        plugins: [vuetify],
       }
    });
    // verify all element change langue
    expect(wrapper.html()).toContain("Home");
    expect(wrapper.html()).toContain("Language");
    expect(wrapper.html()).toContain("Help");
    expect(wrapper.html()).toContain("Logout");
  });

 
});