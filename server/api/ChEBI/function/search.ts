// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { DOMParser, Element, type Document } from "@xmldom/xmldom";
import { sendSoapRequest } from "./soapRequest";

export { getLiteEntity };

/**
 * 
 * @param search string - value to search in ChEBI database
 * @returns list of molecules found or number if error
 */
async function getLiteEntity(search: string): Promise<tChEBI[] | number> {

  // Define request soap
  const WSDL = 'https://www.ebi.ac.uk/webservices/chebi/2.0/webservice?wsdl';
  const nameSpace = 'https://www.ebi.ac.uk/webservices/chebi';
  const SOAPAction = `${nameSpace}/getLiteEntity`
  const soapXml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:chebi="${nameSpace}">
      <soapenv:Header/>
      <soapenv:Body>
        <chebi:getLiteEntity>
          <chebi:search>${search}</chebi:search>
          <chebi:searchCategory>ALL</chebi:searchCategory>
          <chebi:maximumResults>200</chebi:maximumResults>
          <chebi:stars>ALL</chebi:stars>
        </chebi:getLiteEntity>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  // Send request
  return sendSoapRequest(WSDL, soapXml, SOAPAction)
    .then(data => {
      // Verify if we have an error
      if (typeof data === 'number') {
        return 1;
      }
      // Parse the XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      // return the list of molecules found
      return Array.from(xmlDoc.getElementsByTagName('ListElement')).map((node) => {
        // Extract the id and name of the molecule
        return { 
          "id": extractTagValue(node, 'chebiId'),
          "name": extractTagValue(node, 'chebiAsciiName')
        } as tChEBI;
      });
    })
    .catch(() => {
      return 2
    })
}

/**
 * Extract the value of a tag from a XML document
 * @param xmlDoc - the XML document
 * @param tagName - the tag name
 * @returns the value of the tag or undefined
  */
function extractTagValue(xmlDoc: Document | Element, tagName: string): 
    string | undefined | (string | undefined)[] {
  // Get the tag
  const tag = xmlDoc.getElementsByTagName(tagName);
  // Verify if we have a result
  if (tag.length === 0) {
    return undefined;
  }
  // Case of multiple tags
  if (tag.length > 1) {
    return Array.from(tag).map((node) => node.textContent || undefined);
  }
  return tag[0].textContent || undefined;
}