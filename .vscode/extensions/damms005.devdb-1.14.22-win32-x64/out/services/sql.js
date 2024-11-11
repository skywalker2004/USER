"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlService = void 0;
const sequelize_1 = require("sequelize");
const initialization_error_service_1 = require("./initialization-error-service");
exports.SqlService = {
    buildWhereClause(dialect, columns, delimiter, whereClause) {
        if (!whereClause)
            return {
                where: [],
                replacements: []
            };
        return buildWhereClause(dialect, whereClause, columns, delimiter);
    },
    async getRows(dialect, sequelize, table, columns, limit, offset, whereClause) {
        if (!sequelize)
            return;
        let delimiter = '`';
        if (dialect === 'postgres') {
            delimiter = '"';
        }
        const { where, replacements } = this.buildWhereClause(dialect, columns, delimiter, whereClause);
        let limitConstraint = limit ? `LIMIT ${limit}` : '';
        limitConstraint += offset ? ` OFFSET ${offset}` : '';
        const whereString = where.length ? `WHERE ${where.join(' AND ')}` : '';
        let loggedSql = '';
        let rows;
        const sql = `SELECT * FROM ${delimiter}${table}${delimiter} ${whereString} ${limitConstraint}`;
        try {
            rows = await sequelize.query(sql, {
                type: sequelize_1.QueryTypes.SELECT,
                raw: true,
                replacements,
                logging: query => loggedSql = `${loggedSql}\n${query}`
            });
        }
        catch (error) {
            (0, initialization_error_service_1.reportError)(String(error));
            return;
        }
        return { rows, sql: loggedSql };
    },
    async getTotalRows(dialect, sequelize, table, columns, whereClause) {
        if (!sequelize)
            return;
        let delimiter = '`';
        if (dialect === 'postgres') {
            delimiter = '"';
        }
        const { where, replacements } = this.buildWhereClause(dialect, columns, delimiter, whereClause);
        const whereString = where.length ? `WHERE ${where.join(' AND ')}` : '';
        let count;
        try {
            count = await sequelize.query(`SELECT COUNT(*) FROM ${delimiter}${table}${delimiter} ${whereString}`, {
                type: sequelize_1.QueryTypes.SELECT,
                raw: true,
                replacements,
                logging: false
            });
        }
        catch (error) {
            (0, initialization_error_service_1.reportError)(String(error));
            return;
        }
        let totalRows = count[0]['COUNT(*)'];
        if (dialect === 'postgres') {
            totalRows = count[0]['count'];
        }
        return totalRows
            ? Number(totalRows)
            : 0;
    },
};
function buildWhereClause(dialect, whereClause, columns, delimiter) {
    const where = [];
    const replacements = [];
    Object.entries(whereClause)
        .forEach(([column, value]) => {
        const targetColumn = columns.find((c) => c.name === column);
        if (!targetColumn) {
            throw new Error(`Invalid column name: ${column}`);
        }
        if (value === '') { // if user clear the textbox, do not filter the column
            return;
        }
        let operator = 'LIKE';
        if (targetColumn.type === 'boolean') {
            operator = ' is ';
        }
        const isStringablePostgresComparison = /(uuid|integer|smallint|bigint|int\d|timestamp)/.test(targetColumn.type) && dialect === 'postgres';
        if (isStringablePostgresComparison) {
            column = `"${column}"::text`;
            delimiter = '';
        }
        value = getTransformedValue(targetColumn, value);
        where.push(`${delimiter}${column}${delimiter} ${operator} ?`);
        replacements.push(value);
    });
    return { where, replacements };
}
function getTransformedValue(targetColumn, value) {
    if (targetColumn.type === 'boolean') {
        if (typeof value === 'number') {
            return Boolean(value);
        }
        else if (!String(value).trim()) {
            return Boolean(false);
        }
        else if (String(value).trim().toLowerCase() === 'false') {
            return false;
        }
        else if (!isNaN(value)) {
            return Boolean(Number(value));
        }
        else {
            return Boolean(value);
        }
    }
    return `%${value}%`;
}
//# sourceMappingURL=sql.js.map