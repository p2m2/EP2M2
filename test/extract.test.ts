import { describe, test , expect} from 'vitest'
import { mount } from '@vue/test-utils'
import VV from '@/app.vue'

describe('My test', async () => {

  test('my test', () => {
    const pp = mount(VV);
    // console.log(pp.find());
    
  })
})
