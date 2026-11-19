import { useEffect, useState } from 'react';
import type { AuditLogEntry } from '../types/aviation';
import { usePagination } from '../utils/usePagination';
import { TablePagination } from '../components/TablePagination';

interface CommercialSnapshot {
  passenger_capacity?: number | null;
  price_millions_usd?: number | null;
}

function formatChangeSummary(log: AuditLogEntry): string {
  const oldObj: CommercialSnapshot = log.oldValues ? JSON.parse(log.oldValues) : {};
  const newObj: CommercialSnapshot = log.newValues ? JSON.parse(log.newValues) : {};

  if (log.action === 'INSERT') {
    return `Added — Seats: ${newObj.passenger_capacity ?? 'None'}, Price: ${
      newObj.price_millions_usd != null ? `$${newObj.price_millions_usd}M` : 'None'
    }`;
  }

  if (log.action === 'DELETE') {
    return `Removed — Seats: ${oldObj.passenger_capacity ?? 'None'}, Price: ${
      oldObj.price_millions_usd != null ? `$${oldObj.price_millions_usd}M` : 'None'
    }`;
  }

  const changes: string[] = [];
  if (oldObj.passenger_capacity !== newObj.passenger_capacity) {
    changes.push(
      `Seats: ${oldObj.passenger_capacity ?? 'None'} → ${newObj.passenger_capacity ?? 'None'}`
    );
  }
  if (oldObj.price_millions_usd !== newObj.price_millions_usd) {
    const oldP = oldObj.price_millions_usd != null ? `$${oldObj.price_millions_usd}M` : 'None';
    const newP = newObj.price_millions_usd != null ? `$${newObj.price_millions_usd}M` : 'None';
    changes.push(`Price: ${oldP} → ${newP}`);
  }

  return changes.length > 0 ? changes.join(' | ') : 'No value changes';
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${baseUrl}/audit`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: AuditLogEntry[]) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load audit logs: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const filteredLogs =
    actionFilter === 'ALL' ? logs : logs.filter((l) => l.action === actionFilter);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  } = usePagination(filteredLogs, 15);

  return (
    <div>
      <section className="toolbar-row">
        <div className="tab-group">
          {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map((act) => (
            <button
              key={act}
              className={`tab-btn ${actionFilter === act ? 'active' : ''}`}
              onClick={() => setActionFilter(act)}
            >
              {act}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="table-card">
        {loading ? (
          <div className="empty-state">Loading audit history...</div>
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">No audit records found yet.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Aircraft Model</th>
                  <th>What Changed</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((log) => (
                  <tr key={log.auditId}>
                    <td>{new Date(log.changedAt).toLocaleString()}</td>
                    <td>
                      <span className="badge">{log.action}</span>
                    </td>
                    <td><strong>{log.recordKey}</strong></td>
                    <td>{formatChangeSummary(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </div>
  );
}