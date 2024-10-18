// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// call the ChEBI API from webservice 
// https://www.ebi.ac.uk/chebi/webServices.do

// We can call this file like /api/ChEBI?search=epi


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

function getChEBI(search:string){
    // Exemple d'utilisation
    // Setup service
    const WSDL = 'https://www.ebi.ac.uk/webservices/chebi/2.0/webservice?wsdl';
    const nameSpace = 'https://www.ebi.ac.uk/webservices/chebi';
    const SOAPAction = `${nameSpace}/getLiteEntity`
    const soapXml = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
            <soapenv:Header/>
            <soapenv:Body>
                <getLiteEntity xmlns="${nameSpace}">
                    <search>${search}</search>
                </getLiteEntity>
            </soapenv:Body>
        </soapenv:Envelope>`;

    return sendSoapRequest(WSDL, soapXml, SOAPAction)
        .then(response => {
            return response;
        })
        .catch(() => {
            return 2
        })

}

export default defineEventHandler(async (event) => {
    const {search} = getQuery(event);

    // Miss parameter
    if (!search) {
        throw new Error(`Erreur miss search parameter`);
    }

    return await getChEBI(search as string);
})

