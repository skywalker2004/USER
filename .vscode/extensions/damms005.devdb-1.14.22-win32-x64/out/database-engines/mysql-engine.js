"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlEngine = void 0;
const sql_formatter_1 = require("sql-formatter");
const sequelize_1 = require("sequelize");
const sql_1 = require("../services/sql");
class MysqlEngine {
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
        if (!this.sequelize)
            return '';
        const creationSql = await this.sequelize.query(`SHOW CREATE TABLE \`${table}\`;`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        const sql = creationSql[0]['Create Table'];
        return (0, sql_formatter_1.format)(sql, { language: 'sql' });
    }
    async getTables() {
        if (!this.sequelize)
            return [];
        const tables = await this.sequelize.query('SHOW TABLES;', {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        return tables.map((table) => table[`Tables_in_${this.sequelize?.getDatabaseName()}`]).sort();
    }
    async getColumns(table) {
        if (!this.sequelize)
            return [];
        const columns = await this.sequelize.query(`SHOW COLUMNS FROM \`${table}\`;`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        const computedColumns = [];
        for (const column of columns) {
            const foreignKey = await getForeignKeyFor(table, column.Field, this.sequelize);
            computedColumns.push({
                name: column.Field,
                type: column.Type,
                isPrimaryKey: column.Key === 'PRI',
                isOptional: column.Null === 'YES',
                foreignKey
            });
        }
        return computedColumns;
    }
    async getTotalRows(table, columns, whereClause) {
        return sql_1.SqlService.getTotalRows('mysql', this.sequelize, table, columns, whereClause);
    }
    async getRows(table, columns, limit, offset, whereClause) {
        return sql_1.SqlService.getRows('mysql', this.sequelize, table, columns, limit, offset, whereClause);
    }
}
exports.MysqlEngine = MysqlEngine;
async function getForeignKeyFor(table, column, sequelize) {
    const foreignKeys = await sequelize.query(`
		SELECT
			REFERENCED_TABLE_NAME AS \`table\`,
			REFERENCED_COLUMN_NAME AS \`column\`
		FROM
			INFORMATION_SCHEMA.KEY_COLUMN_USAGE
		WHERE
			TABLE_NAME = '${table}'
			AND COLUMN_NAME = '${column}'
			AND REFERENCED_TABLE_NAME IS NOT NULL
	`, {
        type: sequelize_1.QueryTypes.SELECT,
        raw: true,
        logging: false
    });
    if (foreignKeys.length === 0)
        return;
    return foreignKeys[0];
}
//# sourceMappingURL=mysql-engine.js.map