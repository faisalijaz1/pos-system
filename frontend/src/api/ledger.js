import axiosInstance from './axios';

const p = (fromDate, toDate, accountId, page, size) => {
  const params = { page: page ?? 0, size: size ?? 20 };
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (accountId != null) params.accountId = accountId;
  return params;
};

export const ledgerApi = {
  entries: (fromDate, toDate, accountId, page, size) =>
    axiosInstance.get('/v1/ledger/entries', { params: p(fromDate, toDate, accountId, page, size) }),
  /** Ledger report for one account: opening balance, entries with running balance, totals. Paginated. */
  report: (accountId, fromDate, toDate, page = 0, size = 20) =>
    axiosInstance.get('/v1/ledger/report', {
      params: { accountId, fromDate, toDate, page, size },
    }),
  /** Full report for print (all entries, no pagination). */
  reportPrint: (accountId, fromDate, toDate) =>
    axiosInstance.get('/v1/ledger/report/print', {
      params: { accountId, fromDate, toDate },
    }),
  trialBalance: (asOfDate) =>
    axiosInstance.get('/v1/ledger/trial-balance', { params: asOfDate ? { asOfDate } : {} }),
  manualEntry: (body) => axiosInstance.post('/v1/ledger/manual-entry', body),
};
