// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file profides function to handle database queries

import { Pool } from 'pg';

// Params of the database are defined in the .env file
const pool = new Pool();

/**
 * Handles database queries
 * @param query string - The SQL query to execute
 * @param params any - The parameters for the SQL query
 * @returns result - The result of the query
 */
export async function queryDatabase(query:string, params: any) {
  // Connect to the database
  const client = await pool.connect();
  try {
    // Execute the query
    const result = await client.query(query, params);
    return result;
  } finally {
    // Ensure the client is released back to the pool
    client.release(); 
  }
}

