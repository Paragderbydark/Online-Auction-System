import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createDatabase = () => {
  const dataDir = path.join(__dirname, '../../data');

  const readData = (filename) => {
    try {
      const filePath = path.join(dataDir, `${filename}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}.json:`, error);
      return { [filename]: [] };
    }
  };

  const writeData = (filename, data) => {
    try {
      const filePath = path.join(dataDir, `${filename}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}.json:`, error);
      return false;
    }
  };

  const getAll = (collection) => {
    const data = readData(collection);
    return data[collection] || [];
  };

  const getById = (collection, id) => {
    const records = getAll(collection);
    return records.find(record => record.id === String(id));
  };

  const getByQuery = (collection, query = {}) => {
    const records = getAll(collection);
    if (Object.keys(query).length === 0) return records;
    
    return records.filter(record => {
      return Object.entries(query).every(([key, value]) => {
        return record[key] === value;
      });
    });
  };

  const create = (collection, newRecord) => {
    const data = readData(collection);
    const records = data[collection] || [];
    
    const newId = String(records.length > 0 ? Math.max(...records.map(r => parseInt(r.id) || 0)) + 1 : 1);
    const recordWithId = { id: newId, ...newRecord };
    
    records.push(recordWithId);
    data[collection] = records;
    
    const success = writeData(collection, data);
    return success ? recordWithId : null;
  };

  const update = (collection, id, updatedData) => {
    const data = readData(collection);
    const records = data[collection] || [];
    
    const index = records.findIndex(record => record.id === String(id));
    if (index === -1) return null;
    
    records[index] = { ...records[index], ...updatedData, id: String(id) };
    data[collection] = records;
    
    const success = writeData(collection, data);
    return success ? records[index] : null;
  };

  const deleteRecord = (collection, id) => {
    const data = readData(collection);
    const records = data[collection] || [];
    
    const index = records.findIndex(record => record.id === String(id));
    if (index === -1) return false;
    
    records.splice(index, 1);
    data[collection] = records;
    
    return writeData(collection, data);
  };

  const exists = (collection, id) => {
    const records = getAll(collection);
    return records.some(record => record.id === String(id));
  };

  return {
    getAll,
    getById,
    getByQuery,
    create,
    update,
    delete: deleteRecord,
    exists
  };
};

const db = createDatabase();

export default db;
