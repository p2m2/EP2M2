// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// We declare type of response of the p2m2ToolsApi

export type P2M2ToolsApi = {}|{ header : string[], samples : string[][]};

export type P2M2ToolsApiFill = { header : string[], samples : string[][]};