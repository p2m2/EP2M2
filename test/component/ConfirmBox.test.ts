import { mount, config } from '@vue/test-utils';
import { expect, test, describe } from 'vitest';
import { vuetify4Test } from '../extra/vuetify4Test';
import { selectByText } from '../extra/selectByText';
import ConfirmBox from '@/components/ConfirmBox.vue';

const vuetify = vuetify4Test();
// Token to dysplay confirm box
const openConfirmBox = useState<boolean>("openConfirmBox",);
// Token to store message to display in confirm box
const msgConfirmBox = useState<string>("msgConfirmBox");
// token to save the answer of the dialog box
const answerConfirmBox = useState<boolean>("answerConfirmBox");

/**
 * Mount the ConfirmBox component
 * @returns wrapper of ConfirmBox component
 */
function mountConfirmBox(){
    return mount(ConfirmBox, {
        props: {},
        global: {
            plugins: [vuetify],
            stubs: {
                // Default layout is unactive
                NuxtLayout: true,
            },
            mocks:{
                // thx https://stackoverflow.com/a/73630072
                // Get key of translate
                t: (tKey:string) => tKey
            }
        }
      });
}

/**
 * Open the confirm box and return the v-card in dialog
 * @param wrapper wrapper of ConfirmBox component
 * @returns HTMLElement of v-card in dialog
 */
async function openConfirmBoxTest(wrapper: any){
    openConfirmBox.value = true;
    await wrapper.vm.$nextTick();
    return wrapper.getComponent({name: 'v-card'});
}

/**
 * Validate the base elements of confirm box
 * @param wrapper wrapper of ConfirmBox component
 */
function validateBaseConfirmBox(wrapper: any){
    expect(openConfirmBox.value).toBe(true);
    expect(wrapper.text()).toContain('title.confirmBox');
    expect(wrapper.text()).toContain('button.cancel');
    expect(wrapper.text()).toContain('button.yes');
}


describe('ConfirmBox', () => {
    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        // Reset token
        openConfirmBox.value = false;
        msgConfirmBox.value = "";
        answerConfirmBox.value = false;
    })
    
    afterEach(() => {
        config.global.renderStubDefaultSlot = false;
    })

    test('nothing when we not open the confirmBox', () => {
        // Render the ConfirmBox component
        const wrapper =  mountConfirmBox();
        // Get vcard in dialog
        const wrapperDialog = wrapper.getComponent({name: 'v-dialog'});
       
        // ConfirmBox should not be visible
        expect(wrapperDialog.text()).not.toBe('title.confirmBox');
        expect(openConfirmBox.value).toBe(false);
    });

    test('Open the confirmBox empty', async () => {
        // Render the ConfirmBox component
        const wrapper =  mountConfirmBox();
        // Open and Get vcard in dialog
        const dialog = await openConfirmBoxTest(wrapper);
        // ConfirmBox should be visible
        validateBaseConfirmBox(dialog);
    });
  
    test('Open the confirmBox with message', async () => {
        // Render the ConfirmBox component
        const wrapper =  mountConfirmBox();
        // Set message to display in confirm box
        msgConfirmBox.value = "test message";
        // Open and Get vcard in dialog
        const dialog = await openConfirmBoxTest(wrapper);
        // console.log(dialog.html());
        
        // ConfirmBox should be visible
        validateBaseConfirmBox(dialog);
        // ConfirmBox should display message
        expect(dialog.text()).toContain('test message');
    });

    test('Close the confirmBox with cancel, without message',
         async () => {
        // Render the ConfirmBox component
        const wrapper =  mountConfirmBox();
        // Open and Get vcard in dialog
        const dialog = await openConfirmBoxTest(wrapper);
        // ConfirmBox should be visible
        validateBaseConfirmBox(dialog);
        
        // Select button cancel
       const lButton = dialog.findAll('button');
       const button = selectByText(lButton, 'button.cancel');
       // Click on cancel button
       await button.trigger('click');
        // ConfirmBox should be closed
        expect(openConfirmBox.value).toBe(false);
        // ConfirmBox should be closed with false answer
        expect(answerConfirmBox.value).toBe(false);
        // ConfirmBox should not display message
        expect(dialog.text()).not.toContain('test message');
    });

    test('Close the confirmBox with cancel, with message',
        async () => {
       // Render the ConfirmBox component
       const wrapper =  mountConfirmBox();
       // Set message to display in confirm box
       msgConfirmBox.value = "test cancel message";
       // Open and Get vcard in dialog
       const dialog = await openConfirmBoxTest(wrapper);
       // ConfirmBox should be visible
       validateBaseConfirmBox(dialog);

       // Select button cancel
       const lButton = dialog.findAll('button');
       const button = selectByText(lButton, 'button.cancel');
       // Click on cancel button
       await button.trigger('click');
       // ConfirmBox should be closed
       expect(openConfirmBox.value).toBe(false);
       // ConfirmBox should be closed with false answer
       expect(answerConfirmBox.value).toBe(false);
   });

   test('Close the confirmBox with ok, without message',
        async () => {
       // Render the ConfirmBox component
       const wrapper =  mountConfirmBox();
       // Open and Get vcard in dialog
       const dialog = await openConfirmBoxTest(wrapper);
       // ConfirmBox should be visible
       validateBaseConfirmBox(dialog);
       
       // Select button ok
      const lButton = dialog.findAll('button');
      const button = selectByText(lButton, 'button.yes');
      // Click on ok button
      await button.trigger('click');
       // ConfirmBox should be closed
       expect(openConfirmBox.value).toBe(false);
       // ConfirmBox should be closed with true answer
       expect(answerConfirmBox.value).toBe(true);
       // ConfirmBox should not display message
       expect(dialog.text()).not.toContain('test message');
   });

   test('Close the confirmBox with ok, with message',
       async () => {
      // Render the ConfirmBox component
      const wrapper =  mountConfirmBox();
      // Set message to display in confirm box
      msgConfirmBox.value = "test cancel message";
      // Open and Get vcard in dialog
      const dialog = await openConfirmBoxTest(wrapper);
      // ConfirmBox should be visible
      validateBaseConfirmBox(dialog);

      // Select button cancel
      const lButton = dialog.findAll('button');
      const button = selectByText(lButton, 'button.yes');
      // Click on ok button
      await button.trigger('click');
      // ConfirmBox should be closed
      expect(openConfirmBox.value).toBe(false);
      // ConfirmBox should be closed with true answer
      expect(answerConfirmBox.value).toBe(true);
  });
});