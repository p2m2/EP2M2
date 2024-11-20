// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { DOMParser, type Element, type Document } from "@xmldom/xmldom";
import { sendSoapRequest } from "./soapRequest";

export { getLiteEntity, getCompleteEntity };

const WSDL = 'https://www.ebi.ac.uk/webservices/chebi/2.0/webservice?wsdl';
const nameSpace = 'https://www.ebi.ac.uk/webservices/chebi';

/**
 * 
 * @param search string - value to search in ChEBI database
 * @returns list of molecules found or number if error
 */
async function getLiteEntity(search: string): Promise<tChEBI[] | number> {

  // Define request soap
  const SOAPAction = `${nameSpace}/getLiteEntity`
  const soapXml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:chebi="${nameSpace}">
      <soapenv:Header/>
      <soapenv:Body>
        <chebi:getLiteEntity>
          <chebi:search>${search}</chebi:search>
          <chebi:searchCategory>ALL</chebi:searchCategory>
          <chebi:maximumResults>50</chebi:maximumResults>
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
          "id": extractTagValue(node, 'chebiId', true),
          "name": extractTagValue(node, 'chebiAsciiName', true)
        } as tChEBI;
      });
    })
    .catch(() => {
      return 2
    })
}

/**
 * 
 * @param id - ChEBI id of the molecule
 * @returns complete information of the molecule or number if error
 */
async function getCompleteEntity(id: string): Promise<tChEBI | number> {
  // Define request soap
  const SOAPAction = `${nameSpace}/getCompleteEntity`
  const soapXml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:chebi="${nameSpace}">
        <soapenv:Header/>
        <soapenv:Body>
          <chebi:getCompleteEntity>
            <chebi:chebiId>${id}</chebi:chebiId>
          </chebi:getCompleteEntity>
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
      // return info on molecule
      const mass = extractTagValue(xmlDoc, 'mass', true) as string | undefined;

      return {
        "id": extractTagValue(xmlDoc, 'chebiId', true),
        "name": extractTagValue(xmlDoc, 'chebiAsciiName', true),
        "formula": extractTagValue(xmlDoc, 'Formulae', true),
        "mass": mass ? parseFloat(mass) : undefined,
        "synonyms": extractTagValue(xmlDoc, 'Synonyms')
      } as tChEBI;
    })
    .catch(() => {
      return 2
    })
}

/**
 * Extract the value of a tag from a XML document
 * @param xmlDoc - the XML document
 * @param tagName - the tag name
 * @param one (boolean) - One (true) or several(false, default) result waiting 
 * @returns the value of the tag or undefined
  */
function extractTagValue(xmlDoc: Document | Element,
  tagName: string,
  one?: boolean):
  string | undefined | (string | undefined)[] {

  // Get the tag
  const tag = xmlDoc.getElementsByTagName(tagName);

  // Verify if we have a result
  if (tag.length === 0) {
    return undefined;
  }

  // Create array of result(s)
  const temp = one ? [tag[0]] : Array.from(tag);

  const result = temp.map((node) => {
    // If node have several children
    if (node.childNodes.length > 1) {
      // return text of data tag
      return node.getElementsByTagName('data')[0].textContent || undefined;
    }
    // return text of node
    return node.textContent || undefined;
  });

  // return result(s)
  return one ? result[0] : result;
}