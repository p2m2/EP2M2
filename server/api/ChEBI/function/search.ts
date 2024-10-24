// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { DOMParser } from "@xmldom/xmldom";
import {sendSoapRequest} from "./soapRequest";

export{searchGlobal};

async function searchGlobal(search:string){

    // Setup service
    const WSDL = 'https://www.ebi.ac.uk/webservices/chebi/2.0/webservice?wsdl';
    const nameSpace = 'https://www.ebi.ac.uk/webservices/chebi';
    const SOAPAction = `${nameSpace}/getLiteEntity`
    const soapXml  = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:chebi="${nameSpace}">
      <soapenv:Header/>
      <soapenv:Body>
        <chebi:getLiteEntity>
          <chebi:search>${search}</chebi:search>
          <chebi:searchCategory>CHEBI NAME</chebi:searchCategory>
          <chebi:maximumResults>200</chebi:maximumResults>
          <chebi:stars>ALL</chebi:stars>
        </chebi:getLiteEntity>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

    return sendSoapRequest(WSDL, soapXml, SOAPAction)
        .then(data => {
            // Verify if we have an error
            if (typeof data === 'number') {
                return 1;
            }
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            // console.log(xmlDoc.getElementsByTagName('chebiId'));
            const chebiIds = Array.from(xmlDoc.getElementsByTagName('ListElement')).map((node) => {
                return {"id":node.getElementsByTagName('chebiId')[0].textContent, "name":node.getElementsByTagName('chebiAsciiName')[0].textContent}
            });
            console.log(chebiIds);
            
            return chebiIds;
        })
        .catch(() => {
            return 2
        })
}