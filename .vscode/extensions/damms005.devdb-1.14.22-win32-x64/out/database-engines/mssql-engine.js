"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MssqlEngine = void 0;
const sequelize_1 = require("sequelize");
class MssqlEngine {
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
        const creationSql = await this.sequelize.query(`exec sp_columns '${table}'`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        return JSON.stringify(creationSql, null, 2);
    }
    async getTables() {
        if (!this.sequelize)
            return [];
        const tables = await this.sequelize.query(`
			SELECT TABLE_NAME
			FROM INFORMATION_SCHEMA.TABLES
			WHERE TABLE_TYPE = 'BASE TABLE'
			AND TABLE_NAME NOT IN ('MSreplication_options', 'spt_fallback_db', 'spt_fallback_dev', 'spt_fallback_usg', 'spt_monitor');
		`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false
        });
        return tables.map((table) => table['TABLE_NAME']).sort();
    }
    async getColumns(table) {
        if (!this.sequelize)
            return [];
        const columns = await this.sequelize.query(`SELECT COLUMN_NAME AS Field, DATA_TYPE AS Type, IS_NULLABLE AS [Null], COLUMNPROPERTY(object_id(TABLE_NAME), COLUMN_NAME, 'IsIdentity') AS [Key] FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}';`, {
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
                isPrimaryKey: column.Key === 1,
                isOptional: column.Null === 'YES',
                foreignKey
            });
        }
        return computedColumns;
    }
    async getTotalRows(table, whereClause) {
        if (!this.sequelize)
            return undefined;
        const where = whereClause ? `WHERE ${Object.keys(whereClause).map(key => `${key} = :${key}`).join(' AND ')}` : '';
        const replacements = whereClause ? whereClause : {};
        const result = await this.sequelize.query(`SELECT COUNT(*) as count FROM ${table} ${where}`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false,
            replacements
        });
        return result[0]?.count;
    }
    async getRows(table, columns, limit, offset, whereClause) {
        if (!this.sequelize)
            return undefined;
        const where = whereClause ? `WHERE ${Object.keys(whereClause).map(key => `${key} = :${key}`).join(' AND ')}` : '';
        const replacements = whereClause ? whereClause : {};
        const rows = await this.sequelize.query(`SELECT * FROM ${table} ${where} ORDER BY id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            logging: false,
            replacements
        });
        return { rows };
    }
}
exports.MssqlEngine = MssqlEngine;
async function getForeignKeyFor(table, column, sequelize) {
    const foreignKeys = await sequelize.query(`
		SELECT
			OBJECT_NAME(f.referenced_object_id) AS [table],
			COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS [column]
		FROM
			sys.foreign_keys AS f
		INNER JOIN
			sys.foreign_key_columns AS fc
			ON f.OBJECT_ID = fc.constraint_object_id
		WHERE
			f.parent_object_id = OBJECT_ID(N'${table}')
			AND COL_NAME(fc.parent_object_id, fc.parent_column_id) = N'${column}'
	`, {
        type: sequelize_1.QueryTypes.SELECT,
        raw: true,
        logging: false
    });
    if (foreignKeys.length === 0)
        return;
    return foreignKeys[0];
}
//# sourceMappingURL=mssql-engine.js.map