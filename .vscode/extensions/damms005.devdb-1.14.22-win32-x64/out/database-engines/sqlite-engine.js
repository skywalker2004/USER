"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteEngine = void 0;
const sql_formatter_1 = require("sql-formatter");
const sequelize_1 = require("sequelize");
const sql_1 = require("../services/sql");
const initialization_error_service_1 = require("../services/initialization-error-service");
class SqliteEngine {
    constructor(sqliteFilePath) {
        this.sequelize = null;
        try {
            this.sequelize = new sequelize_1.Sequelize({ dialect: 'sqlite', storage: sqliteFilePath, logging: false });
        }
        catch (error) {
            (0, initialization_error_service_1.reportError)(String(error));
        }
    }
    async isOkay() {
        if (!this.sequelize)
            return false;
        const result = await this.sequelize.query('PRAGMA integrity_check;', { type: sequelize_1.QueryTypes.SELECT });
        return result[0]['integrity_check'] === 'ok';
    }
    async disconnect() {
        if (this.sequelize)
            await this.sequelize.close();
    }
    async getTableCreationSql(table) {
        if (!this.sequelize)
            return '';
        const creationSql = await this.sequelize.query(`SELECT sql FROM sqlite_master WHERE name = '${table}'`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        const sql = creationSql[0].sql;
        return (0, sql_formatter_1.format)(sql, { language: 'sql' });
    }
    async getTables() {
        if (!this.sequelize)
            return [];
        const tables = await this.sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", {
            type: sequelize_1.QueryTypes.SELECT,
            logging: false
        });
        return tables.map((table) => table.name).sort();
    }
    async getColumns(table) {
        if (!this.sequelize)
            return [];
        const columns = await this.sequelize.query(`PRAGMA table_info(\`${table}\`)`, { type: sequelize_1.QueryTypes.SELECT });
        const computedColumns = [];
        for (const column of columns) {
            const foreignKey = await getForeignKeyFor(table, column.name, this.sequelize);
            computedColumns.push({
                name: column.name,
                type: column.type,
                isPrimaryKey: column.pk === 1,
                isOptional: column.notnull === 0,
                foreignKey
            });
        }
        return computedColumns;
    }
    async getTotalRows(table, columns, whereClause) {
        return sql_1.SqlService.getTotalRows('sqlite', this.sequelize, table, columns, whereClause);
    }
    async getRows(table, columns, limit, offset, whereClause) {
        return sql_1.SqlService.getRows('sqlite', this.sequelize, table, columns, limit, offset, whereClause);
    }
}
exports.SqliteEngine = SqliteEngine;
async function getForeignKeyFor(table, column, sequelize) {
    const query = `PRAGMA foreign_key_list(${table});`;
    const foreignKeys = await sequelize.query(query, {
        type: sequelize_1.QueryTypes.RAW,
    });
    if (!foreignKeys || !foreignKeys.length)
        return;
    const foreignKey = foreignKeys[0];
    return {
        table: foreignKey.table,
        column: foreignKey.to,
    };
}
//# sourceMappingURL=sqlite-engine.js.map