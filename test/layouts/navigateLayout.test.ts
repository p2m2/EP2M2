import { mount, config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import MyComponent from '~/layouts/navigateLayout.vue'; 

const vuetify = createVuetify({
    components,
    directives,
  });
  
  global.ResizeObserver = require('resize-observer-polyfill');

describe('MyComponent', () => {
  beforeAll(() => {
    // abort a tag without delete inside
    config.global.renderStubDefaultSlot = true
  })
  
  afterAll(() => {
    config.global.renderStubDefaultSlot = false;
  })

  it('renders tabs with correct names and highlights the current page', async () => {
    const wrapper = mount(MyComponent, {
        props: {},
        global: {
          plugins: [vuetify],
          stubs: {
            // Default layout is unactive
            NuxtLayout: true
          },
          mocks:{
            // thx https://stackoverflow.com/a/73630072
            // Get key of translate
            t: (tKey:string) => tKey
          }
        }
      });

    // Verify tab names
    const tabs = wrapper.findAll('.v-tab');
    expect(tabs).toHaveLength((wrapper.vm as any).listPages.length);

    tabs.forEach((tabWrapper, index) => {
      const tabName = (wrapper.vm as any).listPages[index];
      expect(tabWrapper.text()).toContain("page." + tabName);
    });

    // Verify current tab is highlighted
    const currentIndex = (wrapper.vm as any).currentIndex;
    const highlightedTab = tabs.at(currentIndex);
    // Adjust class name as per your Vuetify version
    expect(highlightedTab?.classes()).toContain('v-tab--selected'); 

    // stop mock
    vi.restoreAllMocks();
  });

  it('calls goToTab function when a tab is clicked', async () => {
    const wrapper = mount(MyComponent, {
      props: {},
      global: {
        plugins: [vuetify],
        stubs: {
          // Default layout is unactive
          NuxtLayout: true
        }
      }
    });
    const goToTabMock = vi.spyOn(wrapper.vm as unknown as typeof MyComponent, 'goToTab');

    // Simulate tab click
    const tab = wrapper.findAll('.v-tab');
    await tab[1].trigger('click');

    // Verify goToTab was called
    expect(goToTabMock).toHaveBeenCalled();
  });

  // Add more test cases as needed
});
