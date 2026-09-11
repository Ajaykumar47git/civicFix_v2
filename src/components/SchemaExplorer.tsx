import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Link2, 
  Layers, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck, 
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CIVICFIX_SCHEMAS } from '../data/schemaDefinitions';
import { TableSchemaMetadata } from '../types/database';

interface SchemaExplorerProps {
  onSelectEntityInER?: (tableName: string) => void;
}

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({ onSelectEntityInER }) => {
  const [selectedTable, setSelectedTable] = useState<TableSchemaMetadata>(CIVICFIX_SCHEMAS[3]); // Default to 'issues'
  const [activeSubTab, setActiveSubTab] = useState<'columns' | 'indexes' | 'foreignKeys' | 'ddl' | 'java'>('columns');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Generate MySQL DDL for the selected table
  const generateMySQLDDL = (table: TableSchemaMetadata) => {
    let sql = `CREATE TABLE \`${table.tableName}\` (\n`;
    
    // Columns
    const colDefs = table.columns.map(c => {
      let def = `  \`${c.name}\` ${c.mysqlType}`;
      if (!c.isNullable) def += ' NOT NULL';
      if (c.defaultValue) def += ` DEFAULT ${c.defaultValue}`;
      if (c.constraints.includes('AUTO_INCREMENT')) def += ' AUTO_INCREMENT';
      def += ` COMMENT '${c.description.replace(/'/g, "\\'")}'`;
      return def;
    });

    // Primary Key
    colDefs.push(`  PRIMARY KEY (\`${table.primaryKey}\`)`);

    // Indexes
    table.indexes.forEach(idx => {
      if (idx.type === 'PRIMARY') return;
      const cols = idx.columns.map(c => `\`${c.replace(' DESC', '')}\`${c.includes('DESC') ? ' DESC' : ''}`).join(', ');
      if (idx.type === 'UNIQUE') {
        colDefs.push(`  UNIQUE KEY \`${idx.name}\` (${cols})`);
      } else if (idx.type === 'SPATIAL') {
        colDefs.push(`  SPATIAL KEY \`${idx.name}\` (${cols})`);
      } else if (idx.type === 'FULLTEXT') {
        colDefs.push(`  FULLTEXT KEY \`${idx.name}\` (${cols})`);
      } else {
        colDefs.push(`  KEY \`${idx.name}\` (${cols})`);
      }
    });

    // Foreign Keys
    table.foreignKeys.forEach(fk => {
      colDefs.push(`  CONSTRAINT \`fk_${table.tableName}_${fk.column}\` FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.targetTable}\` (\`${fk.targetColumn}\`) ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate}`);
    });

    sql += colDefs.join(',\n');
    sql += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='${table.description.replace(/'/g, "\\'")}';`;
    return sql;
  };

  // Generate Java Spring Boot JPA Entity code snippet
  const generateJavaEntity = (table: TableSchemaMetadata) => {
    return `package com.civicfix.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Entity: ${table.displayName}
 * Table: ${table.tableName}
 * Normalization: ${table.normalizationNotes}
 */
@Entity
@Table(name = "${table.tableName}")
@Getter
@Setter
public class ${table.javaEntityName.replace('.java', '')} {

${table.columns.map(c => {
  let annotations = [];
  if (c.isPrimaryKey) {
    annotations.push('    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)');
  } else if (c.isForeignKey) {
    annotations.push(`    @ManyToOne(fetch = FetchType.LAZY${c.isNullable ? '' : ', optional = false'})\n    @JoinColumn(name = "${c.name}")`);
  } else {
    let colAnnot = `    @Column(name = "${c.name}"`;
    if (!c.isNullable) colAnnot += ', nullable = false';
    if (c.name === 'created_at') colAnnot += ', updatable = false';
    colAnnot += ')';
    annotations.push(colAnnot);
    if (c.name === 'created_at') annotations.push('    @CreationTimestamp');
    if (c.name === 'updated_at') annotations.push('    @UpdateTimestamp');
  }
  const fieldName = c.name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return `${annotations.join('\n')}\n    private ${c.javaType} ${fieldName};`;
}).join('\n\n')}
}`;
  };

  const filteredColumns = selectedTable.columns.filter(col => 
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.mysqlType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanatory Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Database Schema & Relational Specifications</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              10 Core Entities
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Complete MySQL 8.0 InnoDB entity definitions with primary keys, foreign key cascading, constraints, and spatial indexes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Normalization:</span>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono font-semibold rounded-md border border-emerald-200">
            3NF / BCNF Certified
          </span>
        </div>
      </div>

      {/* Main Schema Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1 mb-2">
            CivicFix Entities ({CIVICFIX_SCHEMAS.length})
          </div>
          <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {CIVICFIX_SCHEMAS.map((table) => {
              const isSelected = selectedTable.tableName === table.tableName;
              return (
                <button
                  key={table.tableName}
                  id={`select-table-${table.tableName}`}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-mono">{table.tableName}</div>
                    <div className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {table.displayName}
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {table.columns.length} cols
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Details & Tabs Area */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            {/* Table Header & Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold font-mono text-slate-900">{selectedTable.tableName}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                    PK: {selectedTable.primaryKey}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Java: {selectedTable.javaEntityName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{selectedTable.description}</p>
                <p className="text-xs text-slate-500 mt-0.5 italic">
                  <strong className="text-slate-700">Normalization Note:</strong> {selectedTable.normalizationNotes}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleCopy(generateMySQLDDL(selectedTable), 'DDL')}
                  className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-300 flex items-center space-x-1 transition-colors"
                  title="Copy MySQL CREATE TABLE DDL"
                >
                  {copiedText === 'DDL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'DDL' ? 'Copied DDL!' : 'Copy SQL DDL'}</span>
                </button>
                <button
                  onClick={() => handleCopy(generateJavaEntity(selectedTable), 'Java')}
                  className="px-2.5 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 flex items-center space-x-1 transition-colors"
                  title="Copy Java Spring Boot JPA Entity"
                >
                  {copiedText === 'Java' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'Java' ? 'Copied Entity!' : 'Copy Java JPA'}</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex items-center justify-between mt-4 border-b border-slate-200 pb-2">
              <div className="flex space-x-4 text-xs font-medium">
                <button
                  onClick={() => setActiveSubTab('columns')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeSubTab === 'columns'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Columns ({selectedTable.columns.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('indexes')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeSubTab === 'indexes'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Indexes ({selectedTable.indexes.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('foreignKeys')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeSubTab === 'foreignKeys'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Foreign Keys ({selectedTable.foreignKeys.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('ddl')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeSubTab === 'ddl'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  MySQL DDL Code
                </button>
                <button
                  onClick={() => setActiveSubTab('java')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeSubTab === 'java'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Spring Boot JPA
                </button>
              </div>

              {activeSubTab === 'columns' && (
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter columns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Sub-tab 1: Columns Table */}
            {activeSubTab === 'columns' && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">Column Name</th>
                      <th className="py-2.5 px-3 font-semibold">MySQL Type</th>
                      <th className="py-2.5 px-3 font-semibold">Java Type</th>
                      <th className="py-2.5 px-3 font-semibold">Key / Nullable</th>
                      <th className="py-2.5 px-3 font-semibold">Constraints / Default</th>
                      <th className="py-2.5 px-3 font-semibold">Purpose & Semantics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredColumns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900 flex items-center space-x-1.5">
                          {col.isPrimaryKey && <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Primary Key" />}
                          {col.isForeignKey && <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" title={`FK -> ${col.fkTarget}`} />}
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 bg-blue-50/40 rounded">
                          {col.mysqlType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-purple-700">
                          {col.javaType}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {col.isPrimaryKey && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 mr-1">
                              PK
                            </span>
                          )}
                          {col.isForeignKey && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mr-1" title={col.fkTarget}>
                              FK
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            col.isNullable ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700 font-semibold'
                          }`}>
                            {col.isNullable ? 'NULL' : 'NOT NULL'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {col.defaultValue && <span className="text-emerald-700 font-semibold">def: {col.defaultValue} </span>}
                          {col.constraints.join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-tab 2: Indexes View */}
            {activeSubTab === 'indexes' && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">Index Name</th>
                      <th className="py-2.5 px-3 font-semibold">Type</th>
                      <th className="py-2.5 px-3 font-semibold">Indexed Columns</th>
                      <th className="py-2.5 px-3 font-semibold">Performance & Query Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTable.indexes.map((idx) => (
                      <tr key={idx.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                          {idx.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            idx.type === 'PRIMARY' ? 'bg-amber-100 text-amber-800' :
                            idx.type === 'UNIQUE' ? 'bg-indigo-100 text-indigo-800' :
                            idx.type === 'SPATIAL' ? 'bg-emerald-100 text-emerald-800 font-mono' :
                            idx.type === 'FULLTEXT' ? 'bg-purple-100 text-purple-800 font-mono' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {idx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">
                          ({idx.columns.join(', ')})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {idx.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-tab 3: Foreign Keys & Cascading */}
            {activeSubTab === 'foreignKeys' && (
              <div className="mt-4">
                {selectedTable.foreignKeys.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg text-xs">
                    This entity has no outbound foreign keys (Top-level parent lookup or registry table).
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTable.foreignKeys.map((fk) => (
                      <div key={fk.column} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Link2 className="w-4 h-4 text-blue-600" />
                          <span className="font-mono font-bold text-slate-900">{fk.column}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-bold text-blue-700">{fk.targetTable}.{fk.targetColumn}</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            ON DELETE {fk.onDelete}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            ON UPDATE {fk.onUpdate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 4: MySQL DDL Code */}
            {activeSubTab === 'ddl' && (
              <div className="mt-4 relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  {generateMySQLDDL(selectedTable)}
                </pre>
              </div>
            )}

            {/* Sub-tab 5: Java JPA Code */}
            {activeSubTab === 'java' && (
              <div className="mt-4 relative">
                <pre className="p-4 bg-slate-900 text-indigo-300 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  {generateJavaEntity(selectedTable)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
