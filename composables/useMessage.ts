/**
 * SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * SPDX-License-Identifier: MIT
 * 
 * Manage the display of messages
 */

/**
 * Provide a function to display a message in the application
 * @returns success and error functions
 */

export function useMessage() {
  // manage display of message
    const stateMessage = useState<{actif:boolean,
        message:string,
        type:string}>("stateMessage")

  function success(message: string) {
    stateMessage.value.type="success"
    stateMessage.value.message=message
    stateMessage.value.actif=true
  }

  function error(message: string) {
    stateMessage.value.type="error"
    stateMessage.value.message=message
    stateMessage.value.actif=true
  }

  return { success, error };
}