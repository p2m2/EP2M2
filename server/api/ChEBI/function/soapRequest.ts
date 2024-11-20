// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

export{sendSoapRequest};

function sendSoapRequest (url:string, xml:string, soapAction: string) : Promise<number|string> {
    // build header of request
    const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': soapAction 
    };

    // send requeste
    return fetch(url, {
            method: 'POST',
            headers: headers,
            body: xml
        })
        .then(response =>{
            // Fail request
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            // Return value
            return response.text();
        })
        .catch (error => {
            console.error('Erreur lors de la requête SOAP:', error);
            return 1;
        });
}
