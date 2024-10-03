// Copyright © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

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
  