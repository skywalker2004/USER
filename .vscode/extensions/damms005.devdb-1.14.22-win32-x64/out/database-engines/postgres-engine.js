"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresEngine = void 0;
const sequelize_1 = require("sequelize");
const sql_1 = require("../services/sql");
class PostgresEngine {
    constructor(sequelizeInstance) {
        this.sequelize = null;
        this.sequelize = sequelizeInstance;
    }
    async isOkay() {
        if (!this.sequelize)
            return false;
        try {
            await this.sequelize.authenticate();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async disconnect() {
        if (this.sequelize)
            await this.sequelize.close();
    }
    async getTableCreationSql(table) {
        if (!this.sequelize) {
            throw new Error('Not connected to the database');
        }
        const tableCreationSql = await this.sequelize.query(`
        SELECT
            'CREATE TABLE ' || quote_ident(table_name) || ' (' ||
            string_agg(column_name || ' ' ||
                       CASE
                           WHEN data_type = 'character varying' THEN
                               'character varying(' || character_maximum_length || ')'
                           ELSE
                               data_type
                       END, ', ') ||
            ');' AS create_sql
        FROM
            information_schema.columns
        WHERE
            table_name = '${table}'
        GROUP BY
            table_name
    `, { type: sequelize_1.QueryTypes.SELECT });
        return tableCreationSql[0]?.create_sql || '';
    }
    async getTables() {
        if (!this.sequelize) {
            throw new Error('Not connected to the database');
        }
        const tables = await this.sequelize.query(`
        SELECT
            tablename
        FROM
            pg_catalog.pg_tables
        WHERE
            schemaname != 'pg_catalog' AND
            schemaname != 'information_schema'
    `, { type: sequelize_1.QueryTypes.SELECT });
        return tables.map((table) => table.tablename);
    }
    async getColumns(table) {
        if (!this.sequelize) {
            throw new Error('Not connected to the database');
        }
        const columns = await this.sequelize.query(`
			SELECT
				column_name AS name,
				data_type AS type
			FROM
				information_schema.columns
			WHERE
				LOWER(table_name) = LOWER('${table}')
		`, { type: sequelize_1.QueryTypes.SELECT });
        const computedColumns = [];
        for (const column of columns) {
            const foreignKey = await getForeignKeyFor(table, column.name, this.sequelize);
            computedColumns.push({
                name: column.name,
                type: column.type,
                isPrimaryKey: false, // <- TODO: implement and update https://github.com/damms005/devdb-vscode/blob/5f0ead1b0e466c613af7d9d39a9d4ef4470e9ebf/README.md#L127
                isOptional: false, // <- TODO: implement and update https://github.com/damms005/devdb-vscode/blob/5f0ead1b0e466c613af7d9d39a9d4ef4470e9ebf/README.md#L127
                foreignKey
            });
        }
        return computedColumns;
    }
    async getTotalRows(table, columns, whereClause) {
        return sql_1.SqlService.getTotalRows('postgres', this.sequelize, table, columns, whereClause);
    }
    async getRows(table, columns, limit, offset, whereClause) {
        return sql_1.SqlService.getRows('postgres', this.sequelize, table, columns, limit, offset, whereClause);
    }
}
exports.PostgresEngine = PostgresEngine;
async function getForeignKeyFor(table, column, sequelize) {
    const foreignKeys = await sequelize.query(`
			SELECT
					ccu.table_name AS referenced_table,
					ccu.column_name AS referenced_column
			FROM
					information_schema.table_constraints tc
			JOIN information_schema.key_column_usage kcu
					ON tc.constraint_name = kcu.constraint_name
			JOIN information_schema.constraint_column_usage ccu
					ON ccu.constraint_name = tc.constraint_name
			WHERE
					tc.constraint_type = 'FOREIGN KEY'
					AND kcu.table_name = LOWER('${table}')
					AND kcu.column_name = LOWER('${column}')
	`, { type: sequelize_1.QueryTypes.SELECT });
    if (foreignKeys.length === 0)
        return undefined;
    return {
        table: foreignKeys[0].referenced_table,
        column: foreignKeys[0].referenced_column
    };
}
//# sourceMappingURL=postgres-engine.js.map