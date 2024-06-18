import * as v from 'valibot';

export const useValibot = (schema, value) => {

    try {
        v.parse(schema, value);
      } catch (e) {
        if (e instanceof v.ValiError) {
          // Handle the validation error
          return(e.message);
        }
      }
    return true
  }
  